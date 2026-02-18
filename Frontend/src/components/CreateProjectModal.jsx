import React, { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';

const ICONS = ['📋', '🚀', '💡', '🎯', '🔥', '⚡', '🌟', '🎨', '🏗️', '📊', '🛠️', '🎮'];
const COLORS = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/projects', { title, description, color, icon });
      onCreated(res.data.project);
      setTitle(''); setDescription('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Icon & Color preview */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ backgroundColor: `${color}33`, border: `2px solid ${color}55` }}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-400 mb-2">Choose icon</div>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map(i => (
                <button key={i} type="button" onClick={() => setIcon(i)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${icon === i ? 'bg-violet-600/30 ring-1 ring-violet-500' : 'hover:bg-muted'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Project color</div>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-white scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Project name *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Project"
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this project about?"
            rows={3}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 bg-muted hover:bg-border text-slate-300 rounded-xl transition-colors font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-violet-500/20 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}