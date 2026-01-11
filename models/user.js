const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // password won't return by default
        },

        gender: {
            type: String,
            // enum: ['male', 'female', 'other'],
            required: true,
        },

        interested_in: {
            type: String,
            enum: ['male', 'female', 'both']
        },

        dob: {
            type: Date,
            required: true,
        },

        age: {
            type: Number,
            min: 18,
        },

        bio: {
            type: String,
            maxlength: 300,
        },

        city: {
            type: String,
            trim: true,
        },

        hobby: {
            type: [String], // array of hobbies
        },
        gallery: {
            type: [String], // array of gallery
        },

        height: {
            type: Number, // in cm
        },

        profileType: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },

        credits: {
            type: Number,
            default: 0,
        },
        profile_img: {
            type: String
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
