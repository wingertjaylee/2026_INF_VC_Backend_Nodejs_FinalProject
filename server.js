require('dotenv').config();
global.crypto = require('crypto');

const express = require('express');
const app = express();

const cors = require('cors');
const connectDB = require('./config/dbConn');
const path = require('path');

app.set('json spaces', 2);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/states', require('./routes/states'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '404 - Route Not Found',
    requestedUrl: req.originalUrl
  });
});

// Connect to DB
connectDB();

// Start Server
const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
