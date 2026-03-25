const router = require('express').Router();
const Service = require('../models/Service');
const requireAuth = require('../middleware/auth');

// GET /api/services
router.get('/', requireAuth, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.json(services.map(s => ({ id: s._id, name: s.name, description: s.description })));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/services  (admin only)
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    const { name, description = '' } = req.body;
    if (!name) return res.status(400).json({ message: 'Service name required.' });
    const service = await Service.create({ name, description });
    res.status(201).json({ id: service._id, name: service.name, description: service.description });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/services/:id  (admin only)
router.put('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    const { name, description } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(description !== undefined && { description }) },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    res.json({ id: service._id, name: service.name, description: service.description });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/services/:id  (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
