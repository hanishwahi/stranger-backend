const User = require("../../models/user");
const { sendNotification } = require("../../services/notification.service");

exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }


        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent duplicate follow
        if (targetUser.followers.includes(currentUserId)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        // PRIVATE PROFILE LOGIC
        if (targetUser.profileType === "private") {
            const cost = 20;

            if (currentUser.credits < cost) {
                return res.status(403).json({ message: "Insufficient credits" });
            }

            // Deduct credits from current user
            await User.findByIdAndUpdate(
                currentUserId,
                { $inc: { credits: -cost } }
            );

            // Add credits + tokens to target user
            await User.findByIdAndUpdate(
                targetUserId,
                { $inc: { credits: 10 } }
            );
        }

        // FOLLOW
        await User.findByIdAndUpdate(
            targetUserId,
            { $addToSet: { followers: currentUserId } }
        );

        await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { following: targetUserId } }
        );
        if (User) {
            await sendNotification({
                receiver: targetUserId,
                sender: currentUserId,
                type: "FOLLOW",
                message: "started following you"
            });

            res.json({
                message:
                    targetUser.profileType === "private"
                        ? "Followed successfully. 20 credits transferred & 10 tokens added."
                        : "Followed successfully.",
            });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};





exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if actually following
        if (!currentUser.following.includes(targetUserId)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        // REMOVE FOLLOW RELATION
        await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { following: targetUserId } }
        );

        await User.findByIdAndUpdate(
            targetUserId,
            { $pull: { followers: currentUserId } }
        );

        res.status(200).json({ message: "Unfollowed successfully" });

    } catch (error) {
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



