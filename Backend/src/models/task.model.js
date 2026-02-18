const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  column: { type: mongoose.Schema.Types.ObjectId, required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: Date },
  labels: [{ type: String }],
  order: { type: Number, default: 0 },
  attachments: [{
    name: String,
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  checklist: [{
    text: String,
    completed: { type: Boolean, default: false }
  }],
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);