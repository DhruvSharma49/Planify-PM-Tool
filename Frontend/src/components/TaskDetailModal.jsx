import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import Avatar from "./Avatar";
import { PriorityBadge } from "./Badge";
import api from "../utils/API";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../utils/socket";
import { format } from "date-fns";
import LoadingSpinner from "./LoadingSpinner";

const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function TaskDetailModal({
  task,
  project,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || "");
  const [editDesc, setEditDesc] = useState(task?.description || "");
  const [typing, setTyping] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAssignSearch, setShowAssignSearch] = useState(false);
  const typingTimeout = useRef(null);
  const commentsEndRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (!isOpen || !task) return;
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    fetchComments();

    socket.emit("task:join", task._id);
    socket.on("comment:created", ({ comment }) => {
      setComments((prev) => [...prev, comment]);
    });
    socket.on("comment:updated", ({ comment }) => {
      setComments((prev) =>
        prev.map((c) => (c._id === comment._id ? comment : c)),
      );
    });
    socket.on("comment:deleted", ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    });
    socket.on("comment:typing", ({ userName }) => {
      setTyping(userName);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(""), 3000);
    });

    return () => {
      socket.emit("task:leave", task._id);
      socket.off("comment:created");
      socket.off("comment:updated");
      socket.off("comment:deleted");
      socket.off("comment:typing");
    };
  }, [isOpen, task?._id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const fetchComments = async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const res = await api.get(`/comments/task/${task._id}`);
      setComments(res.data.comments);
    } catch {
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentInput = (e) => {
    setNewComment(e.target.value);
    socket.emit("comment:typing", { taskId: task._id, userName: user.name });
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/comments/task/${task._id}`, { content: newComment });
      setNewComment("");
    } catch {
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    await api.delete(`/comments/${commentId}`);
  };

  const saveEdit = async () => {
    try {
      const res = await api.put(`/tasks/${task._id}`, {
        title: editTitle,
        description: editDesc,
      });
      onTaskUpdated(res.data.task);
      setEditing(false);
    } catch {}
  };

  const updatePriority = async (priority) => {
    const res = await api.put(`/tasks/${task._id}`, { priority });
    onTaskUpdated(res.data.task);
  };

  const updateDueDate = async (date) => {
    const res = await api.put(`/tasks/${task._id}`, { dueDate: date || null });
    onTaskUpdated(res.data.task);
  };

  const toggleChecklist = async (idx) => {
    const newChecklist = task.checklist.map((c, i) =>
      i === idx ? { ...c, completed: !c.completed } : c,
    );
    const res = await api.put(`/tasks/${task._id}`, {
      checklist: newChecklist,
    });
    onTaskUpdated(res.data.task);
  };

  const searchUsers = async (q) => {
    if (!q) {
      setSearchResults([]);
      return;
    }
    const res = await api.get(`/users/search?q=${q}`);
    setSearchResults(
      res.data.users.filter(
        (u) => !task.assignees?.some((a) => a._id === u._id),
      ),
    );
  };

  const assignUser = async (userId) => {
    const currentIds = task.assignees?.map((a) => a._id) || [];
    const res = await api.put(`/tasks/${task._id}`, {
      assignees: [...currentIds, userId],
    });
    onTaskUpdated(res.data.task);
    setShowAssignSearch(false);
    setSearchUser("");
    setSearchResults([]);
  };

  const removeAssignee = async (userId) => {
    const currentIds =
      task.assignees?.map((a) => a._id).filter((id) => id !== userId) || [];
    const res = await api.put(`/tasks/${task._id}`, { assignees: currentIds });
    onTaskUpdated(res.data.task);
  };

  const deleteTask = async () => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task._id}`);
    onTaskDeleted(task._id);
    onClose();
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex gap-6">
        {/* Left: main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {editing ? (
            <div className="mb-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xl font-display font-bold text-white bg-surface border border-border rounded-xl px-4 py-2 focus:border-violet-500"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Add description..."
                rows={4}
                className="w-full mt-3 text-sm text-slate-300 bg-surface border border-border rounded-xl px-4 py-3 focus:border-violet-500 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveEdit}
                  className="px-4 py-1.5 bg-violet-600 text-white text-sm rounded-lg font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 bg-muted text-slate-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="mb-4 group cursor-pointer"
              onClick={() => setEditing(true)}
            >
              <h2 className="font-display text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                {task.title}
              </h2>
              {task.description ? (
                <p className="text-sm text-slate-400 whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-slate-600 italic">
                  Add description...
                </p>
              )}
            </div>
          )}

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Checklist
              </h3>
              <div className="space-y-1.5">
                {task.checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      onClick={() => toggleChecklist(idx)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center  transition-colors ${
                        item.completed
                          ? "bg-violet-600 border-violet-600"
                          : "border-border group-hover:border-violet-500"
                      }`}
                    >
                      {item.completed && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${item.completed ? "line-through text-slate-500" : "text-slate-300"}`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Comments
            </h3>
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                {comments.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No comments yet. Start the conversation!
                  </p>
                )}
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex gap-2.5 animate-fade-in"
                  >
                    <Avatar user={comment.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="bg-surface rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-violet-400">
                            {comment.author.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {format(
                                new Date(comment.createdAt),
                                "MMM d, h:mm a",
                              )}
                            </span>
                            {comment.author._id === user._id && (
                              <button
                                onClick={() => deleteComment(comment._id)}
                                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        {comment.isEdited && (
                          <p className="text-xs text-slate-500 mt-1">
                            (edited)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <p className="text-xs text-slate-500 animate-pulse">
                    {typing} is typing...
                  </p>
                )}
                <div ref={commentsEndRef} />
              </div>
            )}

            {/* Comment input */}
            <div className="flex gap-2">
              <Avatar user={user} size="sm" />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={handleCommentInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      postComment();
                    }
                  }}
                  placeholder="Add a comment... (Enter to send)"
                  rows={2}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-sm text-white placeholder-slate-500 focus:border-violet-500 resize-none transition-colors"
                />
                <button
                  onClick={postComment}
                  disabled={posting || !newComment.trim()}
                  className="mt-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {posting ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="w-52  space-y-4">
          {/* Assignees */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Assignees
            </h3>
            <div className="space-y-1.5">
              {task.assignees?.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Avatar user={a} size="xs" />
                    <span className="text-xs text-slate-300">{a.name}</span>
                  </div>
                  <button
                    onClick={() => removeAssignee(a._id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-slate-500 hover:text-red-400 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <button
                onClick={() => setShowAssignSearch(!showAssignSearch)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:text-white border border-dashed border-border hover:border-violet-500 rounded-lg transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Assign member
              </button>
              {showAssignSearch && (
                <div className="absolute top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-xl z-10 animate-slide-in">
                  <input
                    autoFocus
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    placeholder="Search users..."
                    className="w-full px-3 py-2 text-xs bg-transparent text-white placeholder-slate-500 border-b border-border"
                  />
                  {searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => assignUser(u._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left"
                    >
                      <Avatar user={u} size="xs" />
                      <div>
                        <div className="text-xs text-white">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Priority
            </h3>
            <div className="space-y-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => updatePriority(p)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    task.priority === p
                      ? "bg-violet-600/20 text-violet-400"
                      : "text-slate-400 hover:bg-muted"
                  }`}
                >
                  <PriorityBadge priority={p} />
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Due Date
            </h3>
            <input
              type="date"
              value={
                task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
              }
              onChange={(e) => updateDueDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-white focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={deleteTask}
              className="w-full py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
            >
              Delete task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
