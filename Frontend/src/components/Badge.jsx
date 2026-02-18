import React from 'react';

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  medium: { label: 'Medium', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  urgent: { label: 'Urgent', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

export function Label({ text, color }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {text}
    </span>
  );
}