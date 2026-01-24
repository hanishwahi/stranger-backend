const express = require("express");
const { getMyGallery, addGallery, deleteGalleryImage } = require("../controllers/post/post");
const authMiddleware = require("../middlewares/authMiddlware");
const galleryRouter = express.Router();


// add moments
galleryRouter.get('/list', authMiddleware, getMyGallery);
galleryRouter.patch('/add', authMiddleware, addGallery);
galleryRouter.delete('/delete/:galleryId', authMiddleware, deleteGalleryImage);


module.exports = galleryRouter;
