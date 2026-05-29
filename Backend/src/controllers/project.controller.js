const Project = require("../models/projects.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const Notification = require("../models/notification");

// ─── Get all projects ──────────────────────────────────────────────────────────
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
      isArchived: false,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get single project ────────────────────────────────────────────────────────
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      "members.user": req.user._id,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Create project ────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { title, description, color, icon } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const project = new Project({
      title,
      description,
      color,
      icon,
      owner: req.user._id,
    });

    await project.save();

    await project.populate("owner", "name email avatar");
    await project.populate("members.user", "name email avatar");

    req.io.emit("project:created", { project });

    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Update project ────────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or no permission" });
    }

    const { title, description, color, icon, columns } = req.body;

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (icon) project.icon = icon;
    if (columns) project.columns = columns;

    await project.save();

    await project.populate("owner", "name email avatar");
    await project.populate("members.user", "name email avatar");

    req.io.to(`project:${project._id}`).emit("project:updated", {
      project,
    });

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Delete project ────────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or no permission" });
    }

    await Task.deleteMany({ project: project._id });

    req.io.to(`project:${project._id}`).emit("project:deleted", {
      projectId: project._id,
    });

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Invite member ─────────────────────────────────────────────────────────────
const inviteMember = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;

    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const requesterMember = project.members.find(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    const canInvite =
      project.owner._id.toString() === req.user._id.toString() ||
      requesterMember?.role === "admin";

    if (!canInvite) {
      return res
        .status(403)
        .json({ message: "Only owner or admin can invite" });
    }

    const userToInvite = await User.findOne({ email });

    if (!userToInvite) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMember = project.members.some(
      (m) => m.user._id.toString() === userToInvite._id.toString()
    );

    if (isMember) {
      return res.status(409).json({ message: "User is already a member" });
    }

    const alreadyInvited = project.invites.some(
      (i) =>
        i.user.toString() === userToInvite._id.toString() &&
        i.status === "pending"
    );

    if (alreadyInvited) {
      return res.status(409).json({ message: "Invite already sent" });
    }

    project.invites.push({
      user: userToInvite._id,
      role,
      status: "pending",
    });

    await project.save();

    //  Notification collection me save
    const savedNotif = await Notification.create({
      user: userToInvite._id,
      message: `${req.user.name} invited you to project "${project.title}"`,
      type: "project_invite",
      link: `/projects/${project._id}`,
      meta: {
        projectId: project._id,
        projectTitle: project.title,
        invitedBy: req.user._id,
        role,
      },
    });

    req.io.to(`user:${userToInvite._id}`).emit("notification:new", {
      notification: savedNotif,
    });

    res.json({ message: "Invite sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Accept invite ─────────────────────────────────────────────────────────────
const acceptInvite = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const invite = project.invites.find(
      (i) =>
        i.user.toString() === req.user._id.toString() &&
        i.status === "pending"
    );

    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invite not found or already responded" });
    }

    project.members.push({
      user: req.user._id,
      role: invite.role,
    });

    invite.status = "accepted";

    await project.save();

    await project.populate("members.user", "name email avatar");

    //  Invite notification mark as read
    await Notification.updateMany(
      {
        user: req.user._id,
        type: "project_invite",
        "meta.projectId": project._id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    //  Owner notification
    const savedNotif = await Notification.create({
      user: project.owner._id,
      message: `${req.user.name} accepted invitation for "${project.title}"`,
      type: "invite_accepted",
      link: `/projects/${project._id}`,
      meta: {
        projectId: project._id,
      },
    });

    req.io.to(`user:${project.owner._id}`).emit("notification:new", {
      notification: savedNotif,
    });

    req.io.to(`project:${project._id}`).emit("project:member_added", {
      project,
    });

    res.json({
      project,
      message: "Invite accepted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Reject invite ─────────────────────────────────────────────────────────────
const rejectInvite = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const invite = project.invites.find(
      (i) =>
        i.user.toString() === req.user._id.toString() &&
        i.status === "pending"
    );

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    invite.status = "rejected";

    await project.save();

    //  Invite notification read
    await Notification.updateMany(
      {
        user: req.user._id,
        type: "project_invite",
        "meta.projectId": project._id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    // Owner notification
    const savedNotif = await Notification.create({
      user: project.owner,
      message: `${req.user.name} rejected invitation for "${project.title}"`,
      type: "invite_rejected",
      link: `/projects/${project._id}`,
      meta: {
        projectId: project._id,
      },
    });

    req.io.to(`user:${project.owner}`).emit("notification:new", {
      notification: savedNotif,
    });

    res.json({ message: "Invite rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Remove member ─────────────────────────────────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const project = await Project.findById(req.params.id).populate(
      "members.user",
      "name email avatar"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const requesterMember = project.members.find(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    const canRemove =
      project.owner.toString() === req.user._id.toString() ||
      requesterMember?.role === "admin";

    if (!canRemove) {
      return res
        .status(403)
        .json({ message: "Only owner or admin can remove members" });
    }

    if (userId === project.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    project.members = project.members.filter(
      (m) => m.user._id.toString() !== userId
    );

    await project.save();

    await project.populate("members.user", "name email avatar");

    //  Removed user notification
    const savedNotif = await Notification.create({
      user: userId,
      message: `You were removed from project "${project.title}"`,
      type: "removed_from_project",
      link: `/dashboard`,
      meta: {
        projectId: project._id,
      },
    });

    req.io.to(`user:${userId}`).emit("notification:new", {
      notification: savedNotif,
    });

    req.io.to(`user:${userId}`).emit("project:removed", {
      projectId: project._id,
    });

    req.io.to(`project:${project._id}`).emit("project:member_removed", {
      project,
      removedUserId: userId,
    });

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Leave project ─────────────────────────────────────────────────────────────
const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message:
          "Project owner cannot leave. Please delete the project or transfer ownership.",
      });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({ message: "You are not a member" });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );

    await project.save();

    await project.populate("members.user", "name email avatar");

    // Owner notification
    const savedNotif = await Notification.create({
      user: project.owner,
      message: `${req.user.name} left project "${project.title}"`,
      type: "member_left",
      link: `/projects/${project._id}`,
      meta: {
        projectId: project._id,
      },
    });

    req.io.to(`user:${project.owner}`).emit("notification:new", {
      notification: savedNotif,
    });

    req.io.to(`project:${project._id}`).emit("project:member_removed", {
      project,
      removedUserId: req.user._id,
    });

    res.json({ message: "You have left the project" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  inviteMember,
  acceptInvite,
  rejectInvite,
  removeMember,
  leaveProject,
};