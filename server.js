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

// 404 handler - MUST be last
app.use((req, res) => {
  res.status(404);

  res.type('html');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>404 Not Found</title>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The requested endpoint does not exist.</p>
      </body>
    </html>
  `);
});

// Connect to DB
connectDB();

// Start Server
const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
