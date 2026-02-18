import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import api from '../utils/API';
import { getSocket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import BoardColumn from '../components/BoardColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import InviteMemberModal from '../components/InviteMemberModal';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    const socket = getSocket();
    socket.emit('project:join', id);

    socket.on('task:created', ({ task }) => {
      setTasks(prev => [...prev, task]);
    });
    socket.on('task:updated', ({ task }) => {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
      setSelectedTask(prev => prev?._id === task._id ? task : prev);
    });
    socket.on('task:deleted', ({ taskId }) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    });
    socket.on('task:moved', ({ taskId, column, order }) => {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, column, order } : t));
    });
    socket.on('project:updated', ({ project }) => {
      setProject(project);
    });
    socket.on('project:member_added', ({ project }) => {
      setProject(project);
    });

    return () => {
      socket.emit('project:leave', id);
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:moved');
      socket.off('project:updated');
      socket.off('project:member_added');
    };
  }, [id]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistically update
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const updatedTask = { ...task, column: destination.droppableId, order: destination.index };
    setTasks(prev => prev.map(t => t._id === draggableId ? updatedTask : t));

    try {
      await api.patch(`/tasks/${draggableId}/move`, {
        column: destination.droppableId,
        order: destination.index
      });
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t._id === draggableId ? task : t));
    }
  };

  const handleTaskCreated = (task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t._id !== taskId));
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) return null;

  const isOwner = project.owner._id === user._id;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Project header */}
      <div className=" px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${project.color}22`, border: `1px solid ${project.color}44` }}>
              {project.icon}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-slate-400 mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Members */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {project.members.slice(0, 5).map(m => (
                  <Avatar key={m.user._id} user={m.user} size="sm" className="ring-2 ring-surface" />
                ))}
              </div>
              <button
                onClick={() => setShowInvite(true)}
                className="w-9 h-9 rounded-full bg-muted hover:bg-border flex items-center justify-center text-slate-400 hover:text-white transition-colors ring-2 ring-surface"
                title="Invite members"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Task count */}
            <div className="px-3 py-1.5 bg-card border border-border rounded-xl text-sm text-slate-400">
              {tasks.length} tasks
            </div>

            {/* Delete project (owner only) */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 h-full">
            {project.columns
              .sort((a, b) => a.order - b.order)
              .map(column => (
                <BoardColumn
                  key={column._id}
                  column={column}
                  tasks={tasks}
                  projectId={id}
                  onTaskCreated={handleTaskCreated}
                  onTaskClick={(task) => setSelectedTask(task)}
                />
              ))}
          </div>
        </DragDropContext>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={project}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}

      {/* Invite modal */}
      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        project={project}
        onMemberAdded={(updatedProject) => setProject(updatedProject)}
      />

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
          <div className="relative bg-card border border-red-500/30 rounded-2xl p-6 max-w-sm w-full animate-scale-in">
            <h3 className="font-display text-lg font-bold text-white mb-2">Delete Project</h3>
            <p className="text-slate-400 text-sm mb-5">This will permanently delete "{project.title}" and all its tasks. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-muted text-slate-300 rounded-xl font-medium">Cancel</button>
              <button onClick={handleDeleteProject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}