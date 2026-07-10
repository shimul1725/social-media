const Notification = require("../models/Notification");

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name avatar")
      .populate("post", "text image")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark all of the logged-in user's notifications as seen
// @route   PUT /api/notifications/seen
// @access  Private
const markAllAsSeen = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, seen: false },
      { seen: true }
    );

    return res.status(200).json({ message: "All notifications marked as seen" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getNotifications, markAllAsSeen };