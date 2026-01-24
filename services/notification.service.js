const Notification = require("../models/notification");

exports.sendNotification = async ({
    receiver,
    sender,
    type,
    message,
    meta = {}
}) => {
    try {
        // prevent self notification
        if (receiver?.toString() === sender?.toString()) return;

        await Notification.create({
            receiver,
            sender,
            type,
            message,
            meta
        });
    } catch (error) {
        console.error("Notification error:", error);
    }
};
