const express = require('express');
const userRouter = express.Router();
const { signupController, loginController } = require('../controllers/auth/userController');
const { UserProfile, TrendingUsers, ExploreUsers } = require('../controllers/profile/profileController');
const authMiddleware = require('../middlewares/authMiddlware');
const { addCredits } = require('../controllers/credits/credits');

console.log({
    signupController,
    loginController,
    UserProfile,
    authMiddleware,
});

userRouter.post('/register', signupController);
userRouter.post('/login', loginController);
userRouter.get('/info/:id', authMiddleware, UserProfile);
userRouter.get('/discover', authMiddleware, ExploreUsers);

userRouter.post('/credits/add', authMiddleware, addCredits);


module.exports = userRouter;
