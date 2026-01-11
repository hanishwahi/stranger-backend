const express = require('express');
const profileRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');
const { addCredits } = require('../controllers/credits/credits');
const { followUser, unfollowUser } = require('../controllers/profile/hookController');
const { UserProfile, ExploreUsers, updateProfileController } = require('../controllers/profile/profileController');
const { getSpotlightStarUsers } = require('../controllers/profile/spotlightStars');


profileRouter.get('/user/info/:id', authMiddleware, UserProfile);
profileRouter.get('/user/discover', authMiddleware, ExploreUsers);
profileRouter.post('/user/credits-add', authMiddleware, addCredits);
profileRouter.get('/spotlightStars', authMiddleware, getSpotlightStarUsers);
profileRouter.post('/user/follow/:id', authMiddleware, followUser);
profileRouter.post('/user/unfollow/:id', authMiddleware, unfollowUser);
profileRouter.patch('/updateDetails', authMiddleware, updateProfileController);

module.exports = profileRouter;
