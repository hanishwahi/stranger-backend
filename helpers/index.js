const jwt = require("jsonwebtoken");

exports.getDetailsFromToken = async (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Authorization token missing");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired token");
    }



    return decoded; // ✅ full user object
};
