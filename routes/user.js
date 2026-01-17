const express = require('express');
const userRouter = express.Router();
const { signupController, loginController, changePasswordController, getUsername } = require('../controllers/auth/userController');
const authMiddleware = require('../middlewares/authMiddlware');


userRouter.post('/user/register', signupController);
userRouter.post('/user/login', loginController);
userRouter.patch('/user/change-password', authMiddleware, changePasswordController);
userRouter.get('/user/findUsername', authMiddleware, getUsername);



module.exports = userRouter;
