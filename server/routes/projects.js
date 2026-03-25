const router = require('express').Router();
const Project = require('../models/Project');
const requireAuth = require('../middleware/auth');

// GET /api/projects
router.get('/', requireAuth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: 1 });
    // Map _id → id for frontend compatibility
    res.json(projects.map(p => ({ id: p._id, name: p.name, serviceIds: p.serviceIds })));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/projects  (admin only)
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    const { name, serviceIds = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name required.' });
    const project = await Project.create({ name, serviceIds });
    res.status(201).json({ id: project._id, name: project.name, serviceIds: project.serviceIds });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/projects/:id  (admin only)
router.put('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    const { name, serviceIds } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(serviceIds && { serviceIds }) },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json({ id: project._id, name: project.name, serviceIds: project.serviceIds });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/projects/:id  (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
