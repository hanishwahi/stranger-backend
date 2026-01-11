const Post = require("../../models/posts");
const User = require("../../models/user");

/**
 * Calculate spotlight score for a user
 */
const calculateUserSpotlightScore = async (userId, fromDate) => {
    const posts = await Post.find({
        userId,
        createdAt: { $gte: fromDate }
    }).lean();

    let totalLikes = 0;
    let totalComments = 0;

    posts.forEach(post => {
        totalLikes += post.likes?.length || 0;
        totalComments += post.comments?.length || 0;
    });

    const activeDays = Math.max(
        (Date.now() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24),
        1
    );

    return {
        postsCount: posts.length,
        totalLikes,
        totalComments,
        activeDays
    };
};

/**
 * GET Spotlight Star Users
 */
exports.getSpotlightStarUsers = async (req, res) => {
    try {
        const DAYS = 7;
        const LIMIT = 10;

        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - DAYS);

        const currentUser = req.user.id

        const users = await User.find({
            isBlocked: { $ne: true },
            _id: { $ne: currentUser }
        }).select("_id username profile_img followers");


        const spotlightUsers = [];

        for (const userDoc of users) {
            const user = userDoc.toObject();

            const engagement = await calculateUserSpotlightScore(user._id, fromDate);

            const newFollowers = user.followers?.length || 0;

            const score =
                (engagement.postsCount * 4) +
                (engagement.totalLikes * 2) +
                (engagement.totalComments * 3) +
                (newFollowers * 5);

            const finalScore = score / engagement.activeDays;

            if (finalScore > 0) {
                spotlightUsers.push({
                    userId: user._id,
                    username: user.username,
                    profile_img: user.profile_img, // image id or url
                    spotlightScore: Number(finalScore.toFixed(2)),
                    hasFollowed: user.followers?.some(
                        (id) => id.toString() === currentUser.toString()
                    )
                });
            }
        }

        spotlightUsers.sort((a, b) => b.spotlightScore - a.spotlightScore);

        res.status(200).json({
            success: true,
            count: spotlightUsers.length,
            data: spotlightUsers.slice(0, LIMIT)
        });

    } catch (error) {
        console.error("Spotlight User Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch spotlight users"
        });
    }
};
