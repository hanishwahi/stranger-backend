const express = require('express');
const authMiddleware = require('../middlewares/authMiddlware');
const { getMyNotifications, getUnreadCount, markNotificationRead } = require('../controllers/NotificationController');
const notificationRouter = express.Router();

notificationRouter.get("/", authMiddleware, getMyNotifications);
notificationRouter.get("/unread-count", authMiddleware, getUnreadCount);
notificationRouter.patch("/:id/read", authMiddleware, markNotificationRead);


module.exports = notificationRouter;
