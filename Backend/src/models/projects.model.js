const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  color: { type: String, default: '#6366f1' }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' }
  }],
  columns: [columnSchema],
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '📋' },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Add owner as admin member automatically
projectSchema.pre('save', function () {
  if (!this.isNew) return;

  const ownerIsMember = this.members.some(
    m => m.user.toString() === this.owner.toString()
  );

  if (!ownerIsMember) {
    this.members.push({ user: this.owner, role: 'admin' });
  }

  if (this.columns.length === 0) {
    this.columns = [
      { title: 'To Do', order: 0, color: '#94a3b8' },
      { title: 'In Progress', order: 1, color: '#f59e0b' },
      { title: 'In Review', order: 2, color: '#8b5cf6' },
      { title: 'Done', order: 3, color: '#10b981' }
    ];
  }
});


module.exports = mongoose.model('Project', projectSchema);