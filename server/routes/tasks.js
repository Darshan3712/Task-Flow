const router = require('express').Router();
const Task = require('../models/Task');
const requireAuth = require('../middleware/auth');

// GET /api/tasks?projectId=&date=
router.get('/', requireAuth, async (req, res) => {
  try {
    const { projectId, date } = req.query;
    if (!projectId || !date)
      return res.status(400).json({ message: 'projectId and date are required.' });

    const taskDoc = await Task.findOne({ projectId, date });
    res.json(taskDoc ? taskDoc.entries : []);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/tasks/all?projectId=   (get all tasks for a project or ALL projects if no projectId)
router.get('/all', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = projectId ? { projectId } : {};

    const docs = await Task.find(query).sort({ date: 1 });
    const result = {};
    docs.forEach(doc => { 
      if (projectId) {
        result[doc.date] = doc.entries; 
      } else {
        result[`${doc.projectId}_${doc.date}`] = doc.entries;
      }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/tasks  — upsert tasks for a project+date
router.post('/', requireAuth, async (req, res) => {
  try {
    const { projectId, date, entries } = req.body;
    if (!projectId || !date) return res.status(400).json({ message: 'projectId and date required.' });

    const taskDoc = await Task.findOneAndUpdate(
      { projectId, date },
      { entries: entries || [] },
      { upsert: true, new: true }
    );
    res.json(taskDoc.entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/tasks?projectId=&date=
router.delete('/', requireAuth, async (req, res) => {
  try {
    const { projectId, date } = req.query;
    if (!projectId || !date)
      return res.status(400).json({ message: 'projectId and date required.' });

    await Task.findOneAndDelete({ projectId, date });
    res.json({ message: 'Tasks deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
