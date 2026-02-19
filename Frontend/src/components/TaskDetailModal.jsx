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
  onUnarrive,
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
  const [newLabel, setNewLabel] = useState("");
  const [showLabelInput, setShowLabelInput] = useState(false);

  // Checklist state
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [showChecklistInput, setShowChecklistInput] = useState(false);

  // Attachments state
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

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

  // ─── Checklist ────────────────────────────────────────────
  const toggleChecklist = async (idx) => {
    const newChecklist = task.checklist.map((c, i) =>
      i === idx ? { ...c, completed: !c.completed } : c,
    );
    const res = await api.put(`/tasks/${task._id}`, {
      checklist: newChecklist,
    });
    onTaskUpdated(res.data.task);
  };

  const addChecklistItem = async () => {
    const trimmed = newChecklistItem.trim();
    if (!trimmed) return;
    const newChecklist = [
      ...(task.checklist || []),
      { text: trimmed, completed: false },
    ];
    const res = await api.put(`/tasks/${task._id}`, {
      checklist: newChecklist,
    });
    onTaskUpdated(res.data.task);
    setNewChecklistItem("");
    setShowChecklistInput(false);
  };

  const deleteChecklistItem = async (idx) => {
    const newChecklist = task.checklist.filter((_, i) => i !== idx);
    const res = await api.put(`/tasks/${task._id}`, {
      checklist: newChecklist,
    });
    onTaskUpdated(res.data.task);
  };

  // ─── Attachments ──────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onTaskUpdated(res.data.task);
    } catch (err) {
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteAttachment = async (attachmentId) => {
    if (!window.confirm("Remove this attachment?")) return;
    try {
      const res = await api.delete(
        `/tasks/${task._id}/attachments/${attachmentId}`,
      );
      onTaskUpdated(res.data.task);
    } catch {
      alert("Failed to remove attachment.");
    }
  };

  const getFileIcon = (name) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["zip", "rar", "7z"].includes(ext)) return "🗜️";
    if (["mp4", "mov", "avi"].includes(ext)) return "🎥";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── Users / Labels ───────────────────────────────────────
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

  const addLabel = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed || task.labels?.includes(trimmed)) return;
    const res = await api.put(`/tasks/${task._id}`, {
      labels: [...(task.labels || []), trimmed],
    });
    onTaskUpdated(res.data.task);
    setNewLabel("");
    setShowLabelInput(false);
  };

  const removeLabel = async (label) => {
    const res = await api.put(`/tasks/${task._id}`, {
      labels: (task.labels || []).filter((l) => l !== label),
    });
    onTaskUpdated(res.data.task);
  };

  // const toggleArrived = async () => {
  //   try {
  //     const res = await api.put(`/tasks/${task._id}`, { arrived: !task.isArchived });
  //     onTaskUpdated(res.data.task);
  //     if (!task.isArchived) onClose();
  //   } catch (err) {
  //     alert("Failed to update task status.");
  //   }
  // };
  const toggleArrived = async () => {
    try {
      const res = await api.put(`/tasks/${task._id}`, {
        arrived: !task.isArchived,
      });

      if (onUnarrive) onUnarrive(res.data.task); // arrived task ke liye
      if (onTaskUpdated) onTaskUpdated(res.data.task); // normal task ke liye

      if (!task.isArchived && onClose) onClose(); // modal close after unarchive
    } catch {
      alert("Failed to update task status.");
    }
  };

  const deleteTask = async () => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task._id}`);
    onTaskDeleted(task._id);
    onClose();
  };

  if (!task) return null;

  const completedChecklist =
    task.checklist?.filter((c) => c.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex gap-6">
        {/* ── Left: main content ── */}
        <div className="flex-1 min-w-0">
          {/* Archived banner */}
          {task.isArchived && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <svg
                className="w-4 h-4 text-amber-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"
                />
              </svg>
              <span className="text-xs text-amber-400 font-medium">
                This task is archived
              </span>
            </div>
          )}

          {/* Title / Description */}
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

          {/* ── Checklist ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300">
                Checklist
                {totalChecklist > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {completedChecklist}/{totalChecklist}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowChecklistInput(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition-colors"
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
                Add item
              </button>
            </div>

            {/* Progress bar */}
            {totalChecklist > 0 && (
              <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedChecklist / totalChecklist) * 100}%`,
                  }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {(!task.checklist || task.checklist.length === 0) &&
                !showChecklistInput && (
                  <p className="text-xs text-slate-600 italic">
                    No checklist items yet.
                  </p>
                )}
              {task.checklist?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group/item">
                  <div
                    onClick={() => toggleChecklist(idx)}
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                      item.completed
                        ? "bg-violet-600 border-violet-600"
                        : "border-border group-hover/item:border-violet-500"
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
                    className={`text-sm flex-1 ${item.completed ? "line-through text-slate-500" : "text-slate-300"}`}
                  >
                    {item.text}
                  </span>
                  {/* Delete button — visible on hover */}
                  <button
                    onClick={() => deleteChecklistItem(idx)}
                    className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-red-400 transition-all text-base leading-none"
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item input */}
            {showChecklistInput && (
              <div className="flex gap-2 mt-2">
                <input
                  autoFocus
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addChecklistItem();
                    if (e.key === "Escape") {
                      setShowChecklistInput(false);
                      setNewChecklistItem("");
                    }
                  }}
                  placeholder="Add checklist item..."
                  className="flex-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-white placeholder-slate-500 focus:border-violet-500"
                />
                <button
                  onClick={addChecklistItem}
                  className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowChecklistInput(false);
                    setNewChecklistItem("");
                  }}
                  className="px-3 py-1.5 text-xs bg-muted text-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ── Attachments ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300">
                Attachments
                {task.attachments?.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {task.attachments.length}
                  </span>
                )}
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition-colors disabled:opacity-50"
              >
                {uploadingFile ? (
                  <span className="animate-pulse">Uploading...</span>
                ) : (
                  <>
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Upload file
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Empty state */}
            {(!task.attachments || task.attachments.length === 0) && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group"
              >
                <svg
                  className="w-6 h-6 text-slate-600 group-hover:text-violet-400 mx-auto mb-1 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <p className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                  Click to attach a file (max 10MB)
                </p>
              </div>
            )}

            {/* Attachment list */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-2">
                {task.attachments.map((att) => (
                  <div
                    key={att._id}
                    className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-lg group/att hover:border-violet-500/20 transition-colors"
                  >
                    <span className="text-lg flex-shrink-0">
                      {getFileIcon(att.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white hover:text-violet-400 transition-colors truncate block"
                      >
                        {att.name}
                      </a>
                      <div className="flex items-center gap-2 mt-0.5">
                        {att.size && (
                          <span className="text-xs text-slate-500">
                            {formatFileSize(att.size)}
                          </span>
                        )}
                        {att.uploadedAt && (
                          <span className="text-xs text-slate-600">
                            · {format(new Date(att.uploadedAt), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAttachment(att._id)}
                      className="opacity-0 group-hover/att:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1 rounded"
                      title="Remove attachment"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Comments ── */}
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

        {/* ── Right: sidebar ── */}
        <div className="w-52 space-y-4">
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

          {/* Labels */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Labels
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels && task.labels.length > 0 ? (
                task.labels.map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  >
                    {label}
                    <button
                      onClick={() => removeLabel(label)}
                      className="hover:text-red-400 transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic">No labels</p>
              )}
            </div>
            {showLabelInput ? (
              <div className="flex gap-1">
                <input
                  autoFocus
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLabel();
                    if (e.key === "Escape") setShowLabelInput(false);
                  }}
                  placeholder="Label name..."
                  className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded-lg text-white placeholder-slate-500 focus:border-violet-500"
                />
                <button
                  onClick={addLabel}
                  className="px-2 py-1 text-xs bg-violet-600 text-white rounded-lg font-medium"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLabelInput(true)}
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
                Add label
              </button>
            )}
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

          {/* Archive & Delete */}
          <div className="pt-2 border-t border-border space-y-1">
            <button
              onClick={toggleArrived}
              className={`w-full py-1.5 text-xs rounded-lg transition-colors font-medium ${
                task.isArchived
                  ? "text-green-400 hover:bg-green-500/10"
                  : "text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              {task.isArchived
                ? "📦 Unarchive task"
                : "📦 Arrived / Archive task"}
            </button>

            <button
              onClick={deleteTask}
              className="w-full py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
            >
              🗑 Delete task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
