require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected Successfully'))
  .catch(err => console.error('Database cannot be Connected:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/qr', require('./routes/qr'));

// Dynamic QR redirect
const User = require('./models/User');
app.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).send('User not found');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
      <meta http-equiv="refresh" content="5;url=${user.currentLink}">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
      </style>
    </head>
    <body>
      <h2>Hi! Redirecting you to the latest link for <b>${user.username}</b> in 5 seconds...</h2>
      <p>If not redirected, <a href="${user.currentLink}">click here</a>.</p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
});
