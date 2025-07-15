const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashed, currentLink: 'https://example.com', linkHistory: [] });
    req.session.userId = user._id;
    res.redirect('/dashboard.html');
  } catch (e) {
    res.status(400).send('Username already exists');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('No user');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send('Wrong password');
  req.session.userId = user._id;
  res.redirect('/dashboard.html');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.delete('/delete', async (req, res) => {
  if (!req.session.userId) return res.status(401).send('Not logged in');
  await User.findByIdAndDelete(req.session.userId);
  req.session.destroy();
  res.json({ message: 'Account deleted' });
});

module.exports = router;
