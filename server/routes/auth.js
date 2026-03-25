const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required.' });

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role, designation: user.designation },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, designation: user.designation }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/setup-admin  (first-time only — creates admin if none exists)
router.post('/setup-admin', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(400).json({ message: 'Admin already exists.' });

    const admin = new User({
      name: 'Admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();
    res.json({ message: 'Admin account created. Username: admin / Password: admin123' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
