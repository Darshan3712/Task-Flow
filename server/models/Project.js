const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
