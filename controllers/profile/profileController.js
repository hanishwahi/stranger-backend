const User = require("../../models/user")
const Post = require("../../models/posts")

exports.UserProfile = async (req, res) => {
    try {
        const userId = req.params.id

        // Get user without password
        const user = await User.findById(userId).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Parallel counts (FAST)
        const [followersCount, followingCount, postsCount] = await Promise.all([
            User.countDocuments({ following: userId }), // followers
            User.countDocuments({ followers: userId }), // following
            Post.countDocuments({ userId }), // posts
        ])

        res.status(200).json({
            success: true,
            user,
            counts: {
                followers: followersCount,
                following: followingCount,
                posts: postsCount,
            },
        })
    } catch (error) {
        console.error("Error fetching user profile:", error)
        res.status(500).json({ message: "Server error" })
    }
}


exports.ExploreUsers = async (req, res) => {
    try {
        const search = req.query.search?.toLowerCase()
        console.log("search", search);

        let filter = {}

        if (search === "alpha") {
            filter.gender = "male"
        } else if (search === "baddie") {
            filter.gender = "female"
        }
        console.log("filter", filter);

        const users = await User.find(filter).select("-password")

        res.status(200).json({
            success: true,
            data: users,
        })
    } catch (error) {
        console.error("Error fetching explore users:", error)
        res.status(500).json({ message: "Server error" })
    }
}

