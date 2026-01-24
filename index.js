const express = require('express');
const connectDB = require('./config/db');
const userRouter = require('./routes/user');
const cors = require('cors');
const postRouter = require('./routes/post/posts');
const profileRouter = require('./routes/profile');
const galleryRouter = require('./routes/gallery');
const notificationRouter = require('./routes/NotificationRoutes');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors())

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/auth', userRouter)
app.use('/profile', profileRouter)
app.use('/post', postRouter)
app.use('/moments', galleryRouter)
app.use('/notifications', notificationRouter)




app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
