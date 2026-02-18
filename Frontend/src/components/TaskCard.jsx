import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { PriorityBadge } from './Badge';
import Avatar from './Avatar';
import { format, isPast, isToday } from 'date-fns';

export default function TaskCard({ task, index, onClick }) {
  const isDue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const completedChecklist = task.checklist?.filter(c => c.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`task-card bg-card border rounded-xl p-3.5 cursor-pointer group transition-all ${
            snapshot.isDragging
              ? 'border-violet-500/50 shadow-xl shadow-violet-500/20 rotate-1 scale-105'
              : 'border-border hover:border-violet-500/20'
          }`}
        >
          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.slice(0, 3).map(label => (
                <span key={label}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  {label}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-sm font-medium text-white leading-snug mb-2.5 group-hover:text-violet-200 transition-colors">
            {task.title}
          </h3>

          {/* Due date & priority */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                isDue
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : isDueToday
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {isDue ? '⚠ ' : isDueToday ? '⏰ ' : '📅 '}
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>

          {/* Checklist progress */}
          {totalChecklist > 0 && (
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{completedChecklist}/{totalChecklist}</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Assignees & comments indicator */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-1">
              {task.assignees?.slice(0, 3).map(a => (
                <Avatar key={a._id} user={a} size="xs" className="ring-2 ring-card" />
              ))}
              {(task.assignees?.length || 0) > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-xs text-slate-400">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
            {task.description && (
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}