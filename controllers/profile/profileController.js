const User = require("../../models/user")
const Post = require("../../models/posts")

exports.UserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.id;

        // Get user without password
        const user = await User.findById(userId)
            .select('-password')
            .lean(); // ✅ lean for faster + plain object

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check follow status
        const hasFollowed = user.followers?.some(
            (id) => id.toString() == currentUserId
        );

        // Parallel counts (FAST)
        const [followersCount, followingCount, postsCount] = await Promise.all([
            User.countDocuments({ following: userId }), // followers
            User.countDocuments({ followers: userId }), // following
            Post.countDocuments({ userId }), // posts
        ]);

        res.status(200).json({
            success: true,
            user: {
                ...user,
                hasFollowed, // ✅ added here
            },
            counts: {
                followers: followersCount,
                following: followingCount,
                posts: postsCount,
            },
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.ExploreUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const search = req.query.search?.trim();

        let filter = {
            _id: { $ne: currentUserId },
        };

        if (search) {
            const lowerSearch = search.toLowerCase();

            if (lowerSearch === "alpha") {
                filter.gender = "male";
            } else if (lowerSearch === "baddie") {
                filter.gender = "female";
            } else {
                const words = lowerSearch.split(/\s+/);
                filter.$or = words.map(word => ({
                    username: {
                        $regex: word,
                        $options: "i"
                    }
                }));
            }
        }

        const users = await User.find(filter).select("-password");

        res.status(200).json({
            success: true,
            data: users,
        });

    } catch (error) {
        console.error("Error fetching explore users:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.updateProfileController = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware 
        const {
            username,
            email,
            phone,
            profileType,
            gender,
            hobby,
            bio,
            city,
            interested_in,
            height,
            isActive,
            profile_img
        } = req.body || {}

        // 1️⃣ Allowed fields only (prevents unwanted updates)
        const updateFields = {};
        if (email) updateFields.email = email;
        if (username) updateFields.username = username;
        if (phone) updateFields.phone = phone;
        if (profileType) updateFields.profileType = profileType;
        if (gender) updateFields.gender = gender;
        if (hobby) updateFields.hobby = hobby;
        if (bio) updateFields.bio = bio;
        if (city) updateFields.city = city;
        if (interested_in) updateFields.interested_in = interested_in;
        if (height) updateFields.height = height;
        if (isActive) updateFields.isActive = isActive;
        if (profile_img) updateFields.profile_img = profile_img;

        // 2️⃣ Check email uniqueness (if email update requested)
        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(409).json({ message: 'Email already in use' });
            }
        }

        // 3️⃣ Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 4️⃣ Success response
        res.status(200).json({
            message: 'Profile updated successfully',
            status: true,
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
