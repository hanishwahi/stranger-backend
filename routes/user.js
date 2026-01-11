const express = require('express');
const userRouter = express.Router();
const { signupController, loginController, changePasswordController } = require('../controllers/auth/userController');
const authMiddleware = require('../middlewares/authMiddlware');


userRouter.post('/user/register', signupController);
userRouter.post('/user/login', loginController);
userRouter.patch('/user/change-password', authMiddleware, changePasswordController);


module.exports = userRouter;
