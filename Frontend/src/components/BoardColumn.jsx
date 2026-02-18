import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import api from '../utils/API';

export default function BoardColumn({ column, tasks, projectId, onTaskCreated, onTaskClick }) {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/tasks/project/${projectId}`, {
        title: newTaskTitle,
        column: column._id
      });
      onTaskCreated(res.data.task);
      setNewTaskTitle('');
      setAddingTask(false);
    } catch {}
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
    if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle(''); }
  };

  const columnTasks = tasks.filter(t => t.column === column._id);

  return (
    <div className="flex flex-col w-72 ">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="font-semibold text-slate-300 text-sm">{column.title}</span>
          <span className="bg-muted text-slate-400 text-xs px-1.5 py-0.5 rounded-md font-mono">{columnTasks.length}</span>
        </div>
        <button
          onClick={() => setAddingTask(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-muted transition-colors"
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-16 rounded-xl p-2 space-y-2 transition-colors board-column ${
              snapshot.isDraggingOver ? 'bg-violet-500/8 border border-violet-500/20' : 'bg-surface/50'
            }`}
          >
            {columnTasks
              .sort((a, b) => a.order - b.order)
              .map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            {provided.placeholder}

            {/* Add task inline form */}
            {addingTask && (
              <div className="bg-card border border-violet-500/30 rounded-xl p-3 animate-slide-in">
                <textarea
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Task title..."
                  rows={2}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddTask}
                    disabled={loading || !newTaskTitle.trim()}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Adding...' : 'Add task'}
                  </button>
                  <button
                    onClick={() => { setAddingTask(false); setNewTaskTitle(''); }}
                    className="px-3 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add task button */}
      {!addingTask && (
        <button
          onClick={() => setAddingTask(true)}
          className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-muted rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      )}
    </div>
  );
}