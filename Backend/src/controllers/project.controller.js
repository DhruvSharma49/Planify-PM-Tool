const Project = require("../models/projects.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");

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

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Create project ────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { title, description, color, icon } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

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
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or no permission" });

    const { title, description, color, icon, columns } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (icon) project.icon = icon;
    if (columns) project.columns = columns;

    await project.save();
    await project.populate("owner", "name email avatar");
    await project.populate("members.user", "name email avatar");

    req.io.to(`project:${project._id}`).emit("project:updated", { project });
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
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or no permission" });

    await Task.deleteMany({ project: project._id });
    req.io
      .to(`project:${project._id}`)
      .emit("project:deleted", { projectId: project._id });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Invite member (send invite notification) ──────────────────────────────────
// POST /projects/:id/invite
const inviteMember = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;

    // Sirf owner ya admin invite kar sakta hai
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) return res.status(404).json({ message: "Project not found" });

    const requesterMember = project.members.find(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    const canInvite =
      project.owner._id.toString() === req.user._id.toString() ||
      requesterMember?.role === "admin";
    if (!canInvite)
      return res
        .status(403)
        .json({ message: "Only owner or admin can invite" });

    // User dhundho
    const userToInvite = await User.findOne({ email });
    if (!userToInvite)
      return res.status(404).json({ message: "User not found" });

    // Already member?
    const isMember = project.members.some(
      (m) => m.user._id.toString() === userToInvite._id.toString(),
    );
    if (isMember)
      return res.status(409).json({ message: "User is already a member" });

    // Already pending invite?
    const alreadyInvited = project.invites.some(
      (i) =>
        i.user.toString() === userToInvite._id.toString() &&
        i.status === "pending",
    );
    if (alreadyInvited)
      return res.status(409).json({ message: "Invite already sent" });

    // Invite add karo project mein
    project.invites.push({ user: userToInvite._id, role, status: "pending" });
    await project.save();

    // Notification bhejo invitee ko
    const notification = {
      message: `${req.user.name} invited you fot this project "${project.title}"`,
      type: "project_invite",
      link: `/projects/${project._id}`,
      meta: {
        projectId: project._id,
        projectTitle: project.title,
        invitedBy: req.user._id,
        role,
      },
      read: false,
      createdAt: new Date(),
    };

    userToInvite.notifications.push(notification);
    await userToInvite.save();

    const savedNotif =
      userToInvite.notifications[userToInvite.notifications.length - 1];

    // Real-time notification
    req.io.to(`user:${userToInvite._id}`).emit("notification:new", {
      notification: savedNotif,
    });

    res.json({ message: "Invite sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Accept invite ─────────────────────────────────────────────────────────────
// POST /projects/:id/accept-invite
const acceptInvite = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Pending invite dhundho
    const invite = project.invites.find(
      (i) =>
        i.user.toString() === req.user._id.toString() && i.status === "pending",
    );
    if (!invite)
      return res
        .status(404)
        .json({ message: "Invite not found or already responded" });

    // Member list mein add karo
    project.members.push({ user: req.user._id, role: invite.role });
    invite.status = "accepted";
    await project.save();
    await project.populate("members.user", "name email avatar");

    // Notification mark karo as read aur update
    const currentUser = await User.findById(req.user._id);
    currentUser.notifications = currentUser.notifications.map((n) => {
      if (
        n.type === "project_invite" &&
        n.meta?.projectId?.toString() === project._id.toString() &&
        !n.read
      ) {
        return { ...n.toObject(), read: true };
      }
      return n;
    });
    await currentUser.save();

    // Owner ko notification bhejo
    const owner = await User.findById(project.owner._id);
    const acceptNotif = {
      message: `${req.user.name} has accepted the invitation for the "${project.title}" project `,
      type: "invite_accepted",
      link: `/projects/${project._id}`,
      meta: { projectId: project._id },
      read: false,
      createdAt: new Date(),
    };
    owner.notifications.push(acceptNotif);
    await owner.save();

    req.io.to(`user:${owner._id}`).emit("notification:new", {
      notification: owner.notifications[owner.notifications.length - 1],
    });

    // Sab project members ko update bhejo
    req.io
      .to(`project:${project._id}`)
      .emit("project:member_added", { project });

    res.json({ project, message: "Invite accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Reject invite ─────────────────────────────────────────────────────────────
// POST /projects/:id/reject-invite
const rejectInvite = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const invite = project.invites.find(
      (i) =>
        i.user.toString() === req.user._id.toString() && i.status === "pending",
    );
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    invite.status = "rejected";
    await project.save();

    // Notification mark as read
    const currentUser = await User.findById(req.user._id);
    currentUser.notifications = currentUser.notifications.map((n) => {
      if (
        n.type === "project_invite" &&
        n.meta?.projectId?.toString() === project._id.toString() &&
        !n.read
      ) {
        return { ...n.toObject(), read: true };
      }
      return n;
    });
    await currentUser.save();

    // Owner ko bhi batao
    const owner = await User.findById(project.owner);
    const rejectNotif = {
      message: `${req.user.name} has declined the invitation for the "${project.title}" project`,
      type: "invite_rejected",
      link: `/projects/${project._id}`,
      meta: { projectId: project._id },
      read: false,
      createdAt: new Date(),
    };
    owner.notifications.push(rejectNotif);
    await owner.save();

    req.io.to(`user:${owner._id}`).emit("notification:new", {
      notification: owner.notifications[owner.notifications.length - 1],
    });

    res.json({ message: "Invite rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Remove member (owner/admin only) ─────────────────────────────────────────
// DELETE /projects/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id).populate(
      "members.user",
      "name email avatar",
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Sirf owner ya admin remove kar sakta hai
    const requesterMember = project.members.find(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    const canRemove =
      project.owner.toString() === req.user._id.toString() ||
      requesterMember?.role === "admin";
    if (!canRemove)
      return res
        .status(403)
        .json({ message: "Only owner or admin can remove members" });

    // Owner khud ko remove nahi kar sakta
    if (userId === project.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    project.members = project.members.filter(
      (m) => m.user._id.toString() !== userId,
    );
    await project.save();
    await project.populate("members.user", "name email avatar");

    // Removed user ko notification
    const removedUser = await User.findById(userId);
    if (removedUser) {
      removedUser.notifications.push({
        message: `  You removed "${project.title} project by the project owner" `,
        type: "removed_from_project",
        read: false,
        createdAt: new Date(),
      });
      await removedUser.save();

      req.io.to(`user:${userId}`).emit("notification:new", {
        notification:
          removedUser.notifications[removedUser.notifications.length - 1],
      });
      // Us user ko project se bhi kick karo
      req.io
        .to(`user:${userId}`)
        .emit("project:removed", { projectId: project._id });
    }

    req.io.to(`project:${project._id}`).emit("project:member_removed", {
      project,
      removedUserId: userId,
    });

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Leave project (member apni marzi se) ─────────────────────────────────────
// POST /projects/:id/leave
const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Owner leave nahi kar sakta
    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message:
          "Project owner cannot leave. Please delete the project or transfer ownership.",
      });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember)
      return res.status(400).json({ message: "You are not a member" });

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.user._id.toString(),
    );
    await project.save();
    await project.populate("members.user", "name email avatar");

    // Owner ko batao
    const owner = await User.findById(project.owner);
    owner.notifications.push({
      message: `${req.user.name} has leave the "${project.title}" project`,
      type: "member_left",
      link: `/projects/${project._id}`,
      meta: { projectId: project._id },
      read: false,
      createdAt: new Date(),
    });
    await owner.save();

    req.io.to(`user:${owner._id}`).emit("notification:new", {
      notification: owner.notifications[owner.notifications.length - 1],
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
