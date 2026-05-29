const Comment = require("../models/comment");
const Task = require("../models/task.model");
const Project = require("../models/projects.model");
const User = require("../models/user.model");
const Notification = require("../models/notification");

const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).populate("project", "members");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isMember = task.project.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name email avatar")
      .populate("mentions", "name email")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions } = req.body;

    const task = await Task.findById(taskId).populate(
      "project",
      "members title _id",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isMember = task.project.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comment = new Comment({
      task: taskId,
      project: task.project._id,
      author: req.user._id,
      content,
      mentions: mentions || [],
    });

    await comment.save();

    await comment.populate("author", "name email avatar");
    await comment.populate("mentions", "name email");

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionId of mentions) {
        if (mentionId.toString() !== req.user._id.toString()) {
          const notification = await Notification.create({
            user: mentionId,
            message: `${req.user.name} mentioned you in a comment on "${task.title}"`,
            type: "comment_added",
            link: `/projects/${task.project._id}`,
          });

          req.io.to(`user:${mentionId}`).emit("notification:new", {
            notification,
          });
        }
      }
    }

    // Notify task assignees
    for (const assigneeId of task.assignees) {
      if (assigneeId.toString() !== req.user._id.toString()) {
        if (!mentions?.includes(assigneeId.toString())) {
          const notification = await Notification.create({
            user: assigneeId,
            message: `${req.user.name} commented on task "${task.title}"`,
            type: "comment_added",
            link: `/projects/${task.project._id}`,
          });

          req.io.to(`user:${assigneeId}`).emit("notification:new", {
            notification,
          });
        }
      }
    }

    req.io.to(`task:${taskId}`).emit("comment:created", {
      comment,
    });

    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found or no permission" });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    await comment.populate("author", "name email avatar");

    req.io.to(`task:${comment.task}`).emit("comment:updated", {
      comment,
    });

    res.json({ comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found or no permission" });
    }

    const taskId = comment.task;

    await comment.deleteOne();

    req.io.to(`task:${taskId}`).emit("comment:deleted", {
      commentId: req.params.id,
    });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
