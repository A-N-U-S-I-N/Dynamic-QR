require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../client/public')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/qr', require('./routes/qr'));

// Dynamic QR redirect
const User = require('./models/User');
app.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).send('User not found');
  res.redirect(user.currentLink);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
