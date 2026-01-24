const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        type: {
            type: String,
            enum: [
                "FOLLOW",
                "LIKE",
                "PROFILE_VIEW",
                "GALLERY_LIKE",
                "SYSTEM"
            ],
            required: true
        },

        message: {
            type: String,
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        },

        meta: {
            type: Object // optional (galleryId, profileId, etc.)
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
