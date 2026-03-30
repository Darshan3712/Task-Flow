const mongoose = require('mongoose');

const taskEntrySchema = new mongoose.Schema({
  id:          { type: String, required: true },
  title:       { type: String, default: '' },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['gray', 'yellow', 'green', 'red'], default: 'gray' },
  employeeIds: [String],
  serviceIds:  [String],
}, { _id: false });

const taskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date:      { type: String, required: true }, // YYYY-MM-DD
  entries:   [taskEntrySchema],
}, { timestamps: true });

// Compound unique index: one task document per project per date
taskSchema.index({ projectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);
