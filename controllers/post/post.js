const { getDetailsFromToken } = require("../../helpers");
const Post = require("../../models/posts");
const User = require('../../models/user');

exports.createPost = async (req, res) => {
    try {
        const { caption, media, isPrivate, } = req.body;
        const userId = req.user.id; // assuming you have authentication middleware 

        if (!media || media.length === 0) {
            return res.status(400).json({ message: "Media is required" });
        }

        const newPost = new Post({
            userId,
            caption,
            media,
            isPrivate: isPrivate || false,
        });

        await newPost.save();

        res.status(201).json({
            status: true,
            message: "Post created successfully",
            post: newPost,
        });
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deletePostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const currentUserId = req.user.id; // comes from auth middleware

        // Find the post
        const post = await Post.findById(postId);
        console.log("posst", post);


        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if current user is the author
        if (post.userId.toString() != currentUserId) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        // Delete the post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete Post Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getPostByLoggedInUser = async (req, res) => {
    try {
        const loggedInUser = await getDetailsFromToken(req);
        const userId = loggedInUser.id;

        const posts = await Post.find({ userId })
            .populate("userId", "username profile_img")
            .populate("comments.userId", "username profile_img")
            .sort({ createdAt: -1 }); // latest first

        if (!posts.length) {
            return res.status(404).json({ message: "No posts found" });
        }

        res.status(200).json({ status: true, data: posts });
    } catch (error) {
        console.error("Get post error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getSinglePostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id)
            .populate('userId', 'username profile_img') // populate user info
            .populate('comments.userId', 'username profile_img'); // populate comment authors

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ post });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPostsByUserId = async (req, res) => {
    try {
        const { id: userId } = req.params;

        // check if user exists
        const user = await User.findById(userId).select('isPrivate');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // fetch posts
        const posts = await Post.find({
            userId: userId,
            ...(user.isPrivate ? { isPrivate: false } : {})
        })
            .populate('userId', 'username profile_img')
            .populate('comments.userId', 'username profile_img')
            .sort({ createdAt: -1 });

        res.status(200).json({ status: true, data: posts });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// all stranger posts 
exports.getAllUsersPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id

        // 1️⃣ Get current user's following list
        const currentUser = await User.findById(currentUserId)
            .select("following")
            .lean();

        const followingIds = currentUser.following.map(id => id.toString());

        // Fetch all posts without filtering by logged-in user
        const posts = await Post.find({
            userId: {
                $nin: [...followingIds, currentUserId],
            },
        })
            .populate({
                path: "userId",
                select: "username profile_img profileType",
                match: { profileType: "public" }, // ✅ ONLY public users
            }) // populate post author info
            .populate('comments.userId', 'username profile_img') // populate comment author info
            .sort({ createdAt: -1 }); // latest posts first

        // ❗ remove posts whose userId didn't match (private profiles)
        const filteredPosts = posts.filter(post => post.userId);

        const finalData = filteredPosts.map((item) => {
            const post = item.toObject();
            const authorId = post.userId?._id?.toString();

            return {
                ...post,
                user: post.userId,
                userId: undefined,
                hasLiked: post.likes.some((likeId) => {
                    return likeId.toString() == currentUserId;
                }),
                hasFollowed: followingIds.includes(authorId), // ✅ added

            };
        });

        res.status(200).json({ status: true, data: finalData });
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getFeedFriendsPosts = async (req, res) => {
    try {
        const loggedInUser = await getDetailsFromToken(req);
        const currentUserId = loggedInUser.id;

        // Get current user's following list
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ include self
        const feedUserIds = [
            ...currentUser.following.map(id => id.toString()),
            currentUserId,
        ];



        // Fetch posts only from following users
        const posts = await Post.find({ userId: { $in: feedUserIds } })
            .populate('userId', 'username profile_img') // populate post author info
            .populate('comments.userId', 'username profile_img') // populate comment author info
            .sort({ createdAt: -1 }); // latest first

        const finalData = posts.map((item) => {
            const post = item.toObject();

            return {
                ...post,
                user: post.userId,
                userId: undefined,

                hasLiked: post.likes.some(
                    (likeId) => likeId.toString() === currentUserId
                ),

                // ✅ always true for friends feed
                hasFollowed: true,
            };
        });
        res.status(200).json({ status: true, data: finalData });
    } catch (error) {
        console.error('Get feed posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const currentUserId = req.user.id; // from auth middleware

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user already liked the post
        const hasLiked = post.likes.includes(currentUserId);

        if (hasLiked) {
            // If already liked, remove the like (unlike)
            post.likes.pull(currentUserId);
            await post.save();
            return res.status(200).json({ message: "Post unliked successfully", likes: post.likes.length });
        } else {
            // Add like
            post.likes.push(currentUserId);
            await post.save();
            return res.status(200).json({ message: "Post liked successfully", likes: post.likes.length });
        }
    } catch (error) {
        console.error("Like Post Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



exports.getLikePostUsers = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .select("likes")
            .populate("likes", "_id username profile_img");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // ✅ Return ONLY likes array
        res.status(200).json({ status: true, data: post.likes });

    } catch (error) {
        console.error("Get Like Users Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
