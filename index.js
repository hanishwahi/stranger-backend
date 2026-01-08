const express = require('express');
const connectDB = require('./config/db');
const userRouter = require('./routes/user');
const cors = require('cors');
const postRouter = require('./routes/post/posts');
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

app.use('/user', userRouter)
app.use('/post', postRouter)




app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
