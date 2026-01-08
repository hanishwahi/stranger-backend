const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from headers
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = { id: user._id, username: user.username };
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = authMiddleware;
