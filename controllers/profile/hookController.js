const User = require("../../models/user");
const mongoose = require("mongoose");

exports.followUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId).session(session);
        const currentUser = await User.findById(currentUserId).session(session);

        if (!targetUser || !currentUser) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent duplicate follow
        if (targetUser.followers.includes(currentUserId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Already following this user" });
        }

        // PRIVATE PROFILE LOGIC
        if (targetUser.profileType === "private") {
            const cost = 20;

            if (currentUser.credits < cost) {
                await session.abortTransaction();
                return res.status(403).json({ message: "Insufficient credits" });
            }

            // Deduct credits from current user
            await User.findByIdAndUpdate(
                currentUserId,
                { $inc: { credits: -cost } },
                { session }
            );

            // Add credits + 10 tokens to target user
            await User.findByIdAndUpdate(
                targetUserId,
                { $inc: { credits: cost, tokens: 10 } },
                { session }
            );
        }

        // FOLLOW (PUBLIC OR PRIVATE)
        await User.findByIdAndUpdate(
            targetUserId,
            { $addToSet: { followers: currentUserId } },
            { session }
        );

        await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { following: targetUserId } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.json({
            message:
                targetUser.profileType === "private"
                    ? "Followed successfully. 20 credits transferred & 10 tokens added."
                    : "Followed successfully.",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};




const mongoose = require("mongoose");
const User = require("../models/User");

exports.unfollowUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const targetUser = await User.findById(targetUserId).session(session);
        const currentUser = await User.findById(currentUserId).session(session);

        if (!targetUser || !currentUser) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found" });
        }

        // Check if actually following
        if (!currentUser.following.includes(targetUserId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "You are not following this user" });
        }

        // REMOVE FOLLOW RELATION
        await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { following: targetUserId } },
            { session }
        );

        await User.findByIdAndUpdate(
            targetUserId,
            { $pull: { followers: currentUserId } },
            { session }
        );

        // ❌ NO CREDIT / TOKEN REVERSAL (important to prevent abuse)

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Unfollowed successfully" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getFollowers = async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate("followers", "username age city");

    res.json({ followers: user.followers });
};

exports.getFollowing = async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate("following", "username age city");

    res.json({ following: user.following });
};
