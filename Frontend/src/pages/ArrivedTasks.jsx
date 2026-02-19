
import React, { useState, useEffect } from 'react';
import api from '../utils/API';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import { FiInbox } from "react-icons/fi";

export default function ArrivedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchArrivedTasks();
  }, []);

  const fetchArrivedTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks/arrived');
      setTasks(Array.isArray(res.data.tasks) ? res.data.tasks : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch arrived tasks');
    } finally {
      setLoading(false);
    }
  };

  // ── FUNCTIONS FOR MODAL CALLBACKS ──
  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleTaskDelete = (deletedId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedId));
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleUnarriveTask = (unarrivedTask) => {
    setTasks((prev) => prev.filter((t) => t._id !== unarrivedTask._id));
    setModalOpen(false);
    setSelectedTask(null);
  };

  if (loading) return <p>Loading arrived tasks...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
if (!tasks.length) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4 shadow-lg">
        <FiInbox className="text-4xl text-violet-400" />
      </div>

      <h2 className="text-xl font-semibold text-white mb-2">
        No arrived tasks yet
      </h2>

      <p className="text-slate-400 max-w-sm">
        Tasks that you mark as arrived will appear here. Stay productive 
      </p>
    </div>
  );
}


  return (
    <div className="p-4 flex flex-wrap gap-3">
      {tasks.map((task, index) => (
        <TaskCard
          key={task._id}
          task={task}
          index={index}
          onClick={() => {
            setSelectedTask(task);
            setModalOpen(true);
          }}
          draggable={false} 
        />
      ))}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onTaskUpdated={handleTaskUpdate}
          onTaskDeleted={handleTaskDelete}
          onUnarrive={handleUnarriveTask}
        />
      )}
    </div>
  );
}
