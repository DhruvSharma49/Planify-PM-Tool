const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);