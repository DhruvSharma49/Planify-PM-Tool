const User = require('../models/user.model');

// Notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notif = user.notifications.id(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    notif.read = true;
    await user.save();
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    }).select('name email avatar').limit(10);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, markNotificationRead, markAllRead, searchUsers, updateProfile };