import React, { useState } from 'react';
import Modal from './Modal';
import api from '../utils/API';
import Avatar from './Avatar';

export default function InviteMemberModal({ isOpen, onClose, project, onMemberAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.post(`/projects/${project._id}/invite`, { email, role });
      onMemberAdded(res.data.project);
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Members">
      <form onSubmit={handleInvite} className="space-y-4">
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">{success}</div>}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-slate-500 focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="px-3 py-3 bg-surface border border-border rounded-xl text-white focus:border-violet-500 transition-colors">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
          {loading ? 'Inviting...' : 'Send Invitation'}
        </button>
      </form>

      {/* Current members */}
      <div className="mt-5 pt-5 border-t border-border">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Current Members ({project.members.length})</h3>
        <div className="space-y-2">
          {project.members.map(m => (
            <div key={m.user._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar user={m.user} size="sm" />
                <div>
                  <div className="text-sm text-white font-medium">{m.user.name}</div>
                  <div className="text-xs text-slate-500">{m.user.email}</div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                m.role === 'admin' ? 'bg-violet-500/20 text-violet-400' :
                m.role === 'viewer' ? 'bg-slate-500/20 text-slate-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}