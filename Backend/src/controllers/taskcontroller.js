const Task = require('../models/task.model');
const Project = require('../models/projects.model');
const User = require('../models/user.model');

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, 'members.user': req.user._id });
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: projectId, isArchived: false })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title members');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findOne({ _id: task.project._id, 'members.user': req.user._id });
    if (!project) return res.status(403).json({ message: 'Access denied' });

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, column, assignees, priority, dueDate, labels } = req.body;

    const project = await Project.findOne({ _id: projectId, 'members.user': req.user._id });
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const count = await Task.countDocuments({ project: projectId, column });
    const task = new Task({
      title, description, column, assignees, priority, dueDate, labels,
      project: projectId,
      createdBy: req.user._id,
      order: count
    });
    await task.save();
    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Notify assignees
    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        if (assigneeId.toString() !== req.user._id.toString()) {
          const assigneeUser = await User.findById(assigneeId);
          if (assigneeUser) {
            assigneeUser.notifications.push({
              message: `You've been assigned to task "${title}" in project "${project.title}"`,
              type: 'task_assigned',
              link: `/projects/${projectId}`
            });
            await assigneeUser.save();
            req.io.to(`user:${assigneeId}`).emit('notification:new', {
              notification: assigneeUser.notifications[assigneeUser.notifications.length - 1]
            });
          }
        }
      }
    }

    req.io.to(`project:${projectId}`).emit('task:created', { task });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'members title');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isMember = task.project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const { title, description, column, assignees, priority, dueDate, labels, order, checklist } = req.body;
    const prevAssignees = task.assignees.map(a => a.toString());

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (column !== undefined) task.column = column;
    if (assignees !== undefined) task.assignees = assignees;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (labels !== undefined) task.labels = labels;
    if (order !== undefined) task.order = order;
    if (checklist !== undefined) task.checklist = checklist;

    await task.save();
    await task.populate('assignees', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Notify new assignees
    if (assignees) {
      const newAssignees = assignees.filter(id => !prevAssignees.includes(id.toString()));
      for (const assigneeId of newAssignees) {
        if (assigneeId.toString() !== req.user._id.toString()) {
          const assigneeUser = await User.findById(assigneeId);
          if (assigneeUser) {
            assigneeUser.notifications.push({
              message: `You've been assigned to task "${task.title}"`,
              type: 'task_assigned',
              link: `/projects/${task.project._id}`
            });
            await assigneeUser.save();
            req.io.to(`user:${assigneeId}`).emit('notification:new', {
              notification: assigneeUser.notifications[assigneeUser.notifications.length - 1]
            });
          }
        }
      }
    }

    req.io.to(`project:${task.project._id}`).emit('task:updated', { task });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'members owner');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isOwnerOrAdmin = task.project.owner.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString();
    if (!isOwnerOrAdmin) return res.status(403).json({ message: 'Access denied' });

    const projectId = task.project._id;
    await task.deleteOne();

    req.io.to(`project:${projectId}`).emit('task:deleted', { taskId: req.params.id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const moveTask = async (req, res) => {
  try {
    const { column, order } = req.body;
    const task = await Task.findById(req.params.id).populate('project', 'members');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isMember = task.project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    task.column = column;
    task.order = order;
    await task.save();

    req.io.to(`project:${task.project._id}`).emit('task:moved', {
      taskId: task._id, column, order, projectId: task.project._id
    });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, moveTask };