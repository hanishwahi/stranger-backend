const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
    },
    { timestamps: true }
);


const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        media:
        {
            type: String, // image/video URLs
            required: true,
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        comments: [commentSchema], // ✅ ADD THIS

        isPrivate: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

postSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.user = ret.userId; // rename
        delete ret.userId;     // remove old key
        return ret;
    },
});
module.exports = mongoose.model("Post", postSchema);
