const Project = require('../models/projects.model');
const Task = require('../models/task.model');
const User = require('../models/user.model');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
      isArchived: false
    }).populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      'members.user': req.user._id
    }).populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, color, icon } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const project = new Project({
      title, description, color, icon,
      owner: req.user._id
    });
    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    req.io.emit('project:created', { project });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or no permission' });

    const { title, description, color, icon, columns } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (icon) project.icon = icon;
    if (columns) project.columns = columns;

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    req.io.to(`project:${project._id}`).emit('project:updated', { project });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or no permission' });

    await Task.deleteMany({ project: project._id });
    req.io.to(`project:${project._id}`).emit('project:deleted', { projectId: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or no permission' });

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: 'User not found' });

    const isMember = project.members.some(m => m.user.toString() === userToInvite._id.toString());
    if (isMember) return res.status(409).json({ message: 'User already a member' });

    project.members.push({ user: userToInvite._id, role });

    // Add notification to invited user
    userToInvite.notifications.push({
      message: `You've been invited to project "${project.title}"`,
      type: 'project_invite',
      link: `/projects/${project._id}`
    });
    await userToInvite.save();
    await project.save();
    await project.populate('members.user', 'name email avatar');

    req.io.to(`user:${userToInvite._id}`).emit('notification:new', {
      notification: userToInvite.notifications[userToInvite.notifications.length - 1]
    });
    req.io.to(`project:${project._id}`).emit('project:member_added', { project });

    res.json({ project, message: 'Member invited successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or no permission' });

    if (userId === req.user._id.toString()) return res.status(400).json({ message: 'Cannot remove owner' });

    project.members = project.members.filter(m => m.user.toString() !== userId);
    await project.save();
    await project.populate('members.user', 'name email avatar');

    req.io.to(`project:${project._id}`).emit('project:member_removed', { project, removedUserId: userId });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, inviteMember, removeMember };