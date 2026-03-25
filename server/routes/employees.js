const router = require('express').Router();
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

// GET /api/employees
router.get('/', requireAuth, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).sort({ createdAt: 1 });
    // Never send passwords to frontend
    res.json(employees.map(e => ({
      id: e._id,
      name: e.name,
      username: e.username,
      designation: e.designation,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/employees  (admin only)
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    const { name, username, password, designation } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: 'Name, username and password required.' });

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'Username already taken.' });

    const emp = await User.create({ name, username, password, role: 'employee', designation });
    res.status(201).json({ id: emp._id, name: emp.name, username: emp.username, designation: emp.designation });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/employees/:id  (admin only)
router.put('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    const { name, username, password, designation } = req.body;
    const emp = await User.findById(req.params.id);
    if (!emp || emp.role !== 'employee') return res.status(404).json({ message: 'Employee not found.' });

    if (name) emp.name = name;
    if (username) emp.username = username.toLowerCase().trim();
    if (designation !== undefined) emp.designation = designation;
    if (password) emp.password = password; // pre-save hook will hash it

    await emp.save();
    res.json({ id: emp._id, name: emp.name, username: emp.username, designation: emp.designation });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/employees/:id  (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
