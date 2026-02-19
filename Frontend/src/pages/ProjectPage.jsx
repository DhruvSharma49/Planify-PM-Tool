import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import api from "../utils/API";
import { getSocket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import BoardColumn from "../components/BoardColumn";
import TaskDetailModal from "../components/TaskDetailModal";
import InviteMemberModal from "../components/InviteMemberModal";
import Avatar from "../components/Avatar";
import LoadingSpinner from "../components/LoadingSpinner";
import { FiPlus, FiTrash2, FiUserMinus, FiLogOut } from "react-icons/fi";

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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    const socket = getSocket();
    socket.emit("project:join", id);

    socket.on("task:created", ({ task }) =>
      setTasks((prev) => [...prev, task]),
    );
    socket.on("task:updated", ({ task }) =>
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t))),
    );
    socket.on("task:deleted", ({ taskId }) =>
      setTasks((prev) => prev.filter((t) => t._id !== taskId)),
    );
    socket.on("task:moved", ({ taskId, column, order }) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, column, order } : t)),
      );
    });
    socket.on("project:updated", ({ project }) => setProject(project));
    socket.on("project:member_added", ({ project }) => setProject(project));
    socket.on("project:member_removed", ({ project, removedUserId }) => {
      setProject(project);
      // Agar current user ko remove kiya gaya to dashboard pe bhejo
      if (removedUserId === user._id) {
        navigate("/dashboard");
      }
    });
    // Agar is user ko project se remove kiya gaya
    socket.on("project:removed", ({ projectId }) => {
      if (projectId === id) navigate("/dashboard");
    });

    return () => {
      socket.emit("project:leave", id);
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      socket.off("task:moved");
      socket.off("project:updated");
      socket.off("project:member_added");
      socket.off("project:member_removed");
      socket.off("project:removed");
    };
  }, [id]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    const updatedTask = {
      ...task,
      column: destination.droppableId,
      order: destination.index,
    };
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? updatedTask : t)),
    );

    try {
      await api.patch(`/tasks/${draggableId}/move`, {
        column: destination.droppableId,
        order: destination.index,
      });
    } catch {
      setTasks((prev) => prev.map((t) => (t._id === draggableId ? task : t)));
    }
  };

  const handleTaskCreated = (task) => setTasks((prev) => [...prev, task]);
  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
    );
    setSelectedTask(updatedTask);
  };
  const handleTaskDeleted = (taskId) =>
    setTasks((prev) => prev.filter((t) => t._id !== taskId));

  // ─── Delete project ──────────────────────────────────────────────────────────
  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      navigate("/dashboard");
    } catch {}
  };

  // ─── Leave project ───────────────────────────────────────────────────────────
  const handleLeaveProject = async () => {
    try {
      await api.post(`/projects/${id}/leave`);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Could not leave project");
    }
  };

  // ─── Remove a member ─────────────────────────────────────────────────────────
  const handleRemoveMember = async (userId) => {
    setRemovingMember(userId);
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.project);
    } catch (err) {
      alert(err?.response?.data?.message || "Could not remove member");
    } finally {
      setRemovingMember(null);
    }
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (!project) return null;

  const isOwner = project.owner._id?.toString() === user._id?.toString();
  const currentMember = project.members.find(
    (m) => m.user?._id?.toString() === user._id?.toString(),
  );
  const isAdmin = currentMember?.role === "admin" || isOwner;
  const canManageMembers = isAdmin;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              backgroundColor: `${project.color}22`,
              border: `1px solid ${project.color}44`,
            }}
          >
            {project.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{project.title}</h1>
            {project.description && (
              <p className="text-sm text-slate-400 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Members avatars — click to open panel */}
          <button
            onClick={() => setShowMembers(true)}
            className="flex -space-x-2 hover:opacity-80 transition-opacity"
            title="View members"
          >
            {project.members.slice(0, 5).map((m) => (
              <Avatar
                key={m.user._id}
                user={m.user}
                size="sm"
                className="ring-2 ring-slate-800"
              />
            ))}
            {project.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-700 ring-2 ring-slate-800 flex items-center justify-center text-xs text-slate-300 font-medium">
                +{project.members.length - 5}
              </div>
            )}
          </button>

          {/* Invite button */}
          <button
            onClick={() => setShowInvite(true)}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors ring-2 ring-slate-700"
            title="Invite members"
          >
            <FiPlus className="text-sm" />
          </button>

          {/* Task count */}
          <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300">
            {tasks.length} tasks
          </div>

          {/* Leave project (non-owners) */}
          {!isOwner && (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Leave project"
            >
              <FiLogOut className="text-sm" />
            </button>
          )}

          {/* Delete project (owner only) */}
          {isOwner && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete project"
            >
              <FiTrash2 className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* ── Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 h-full">
            {project.columns
              .sort((a, b) => a.order - b.order)
              .map((column) => (
                <BoardColumn
                  key={column._id}
                  column={column}
                  tasks={tasks.filter(
                    (t) => t.column?.toString() === column._id?.toString(),
                  )}
                  projectId={id}
                  onTaskCreated={handleTaskCreated}
                  onTaskClick={setSelectedTask}
                />
              ))}
          </div>
        </DragDropContext>
      </div>

      {/* ── Task detail modal ── */}
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

      {/* ── Invite modal ── */}
      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        project={project}
        onMemberAdded={setProject}
      />

      {/* ── Members panel ── */}
      {showMembers && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMembers(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Members ({project.members.length})
              </h3>
              <button
                onClick={() => setShowMembers(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {project.members.map((m) => {
                if (!m?.user) return null; // safety — incomplete member objects skip karo
                const memberId = m.user._id?.toString();
                const isSelf = memberId === user._id?.toString();
                const isProjectOwner =
                  memberId === project.owner?._id?.toString();
                const isRemoving = removingMember === memberId;

                return (
                  <div
                    key={memberId || Math.random()}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors group"
                  >
                    <Avatar user={m.user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium truncate">
                          {m.user.name}
                          {isSelf && (
                            <span className="text-slate-500 font-normal">
                              {" "}
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                      <span
                        className={`text-xs capitalize ${
                          isProjectOwner ? "text-violet-400" : "text-slate-500"
                        }`}
                      >
                        {isProjectOwner ? "Owner" : m.role}
                      </span>
                    </div>

                    {/* Remove button — sirf canManageMembers ko aur owner/self ko nahi */}
                    {canManageMembers && !isProjectOwner && !isSelf && (
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        disabled={isRemoving}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        title={`Remove ${m.user.name}`}
                      >
                        {isRemoving ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <>
                            <FiUserMinus className="w-3 h-3" />
                            Remove
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Invite from members panel */}
            <button
              onClick={() => {
                setShowMembers(false);
                setShowInvite(true);
              }}
              className="w-full mt-4 py-2 text-sm text-violet-400 hover:text-violet-300 border border-dashed border-violet-500/30 hover:border-violet-500/60 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Invite new member
            </button>
          </div>
        </div>
      )}

      {/* ── Leave confirm ── */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-sm w-full animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">
              Leave Project?
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              You will lose access to "{project.title}" and its tasks. You can
              only rejoin if invited again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveProject}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Leave Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">
              Delete Project
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              This will permanently delete "{project.title}" and all its tasks.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
