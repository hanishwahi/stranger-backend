const Notification = require("../models/notification");

exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            receiver: req.user.id
        })
            .populate("sender", "username profile_img")
            .sort({ createdAt: -1 })
            .limit(30);

        res.json({
            status: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, receiver: req.user.id },
            { isRead: true }
        );

        res.json({ status: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.getUnreadCount = async (req, res) => {
    const count = await Notification.countDocuments({
        receiver: req.user.id,
        isRead: false
    });

    res.json({ count });
};
