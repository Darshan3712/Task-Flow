const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://Darshan3712.github.io',
    process.env.FRONTEND_URL // Will allow your Hostinger domain to bypass CORS
  ],
  credentials: true
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/projects',  require('./routes/projects'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/services',  require('./routes/services'));
app.use('/api/tasks',     require('./routes/tasks'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Connect to MongoDB & start ───────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Auto-create Admin on first boot
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      console.log('Creating default Admin account (change credentials inside server/index.js if needed)...');
      const admin = new User({
        name: 'Admin',
        username: 'admin', // CHANGE THIS USERNAME IF YOU WANT
        password: 'admin123', // CHANGE THIS PASSWORD IF YOU WANT
        role: 'admin',
      });
      await admin.save();
    }

    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
