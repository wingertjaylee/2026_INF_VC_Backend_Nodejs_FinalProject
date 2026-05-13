require('dotenv').config();
global.crypto = require('crypto');

const express = require('express');
const app = express();

const cors = require('cors');
const connectDB = require('./config/dbConn');
const path = require('path');

const statesRoutes = require('./routes/states'); 

app.set('json spaces', 2);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static HTML from /public
app.use('/', express.static('public'));

// States API routes
app.use('/states', require('./routes/states'));

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/index.html');
 app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404</title>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
      </body>
    </html>
  `);
});
});


// Connect to DB and start server
connectDB();

app.listen(process.env.PORT || 3500, () =>
    console.log('Server running')
);

