const express = require("express");
const authMiddleware = require("../../middlewares/authMiddlware");
const { createPost, getPostByLoggedInUser, getSinglePostById, getPostsByUserId, getAllUsersPosts, getFeedFriendsPosts, likePost, deletePostById } = require("../../controllers/post/post");

const postRouter = express.Router();

postRouter.post("/create", authMiddleware, createPost);
// all stranger  Posts list 
postRouter.get('/allUserFeed', authMiddleware, getAllUsersPosts);

postRouter.delete('/delete/:id', authMiddleware, deletePostById)
// all user friend Posts list  
postRouter.get('/friendsFeed', authMiddleware, getFeedFriendsPosts);

// all posts by logged user 
postRouter.get('/userPostList', authMiddleware, getPostByLoggedInUser);
// single post by post id
postRouter.get('/:id', authMiddleware, getSinglePostById);


// get any user posts list 
postRouter.get('/list/:id', authMiddleware, getPostsByUserId);
postRouter.patch('/like/:id', authMiddleware, likePost);




module.exports = postRouter;
