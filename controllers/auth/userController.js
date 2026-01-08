const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

exports.signupController = async (req, res) => {
    try {
        const { username, email, phone, password, gender, interested_in, dob, bio, city, hobby, height, } = req.body;

        // 1️⃣ Basic validation
        if (!username || !email || !phone || !password || !gender || !dob) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        // 2️⃣ Check existing user
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with email or phone' });
        }

        // 3️⃣ Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4️⃣ Calculate age from DOB
        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        // 5️⃣ Generate OTP
        // const otp = generateOTP();
        // const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 6️⃣ Create user
        const user = await User.create({
            username, email, phone, password: hashedPassword, gender, interested_in, dob, age, bio, city, hobby, height, isActive: true,
        });

        // 7️⃣ Success response
        res.status(201).json({
            message: 'Signup successful.',
            userId: user._id,
            status: true
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.loginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1️⃣ Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // 2️⃣ Find user by username (explicitly select password)
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }


        // 4️⃣ Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // 5️⃣ Success response (JWT comes later)
        res.status(200).json({
            message: 'Login successful',
            status: true,
            authToken: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};