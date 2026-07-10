const User = require("../models/User");
const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

// @desc    Follow a user
// @route   PUT /api/users/follow/:id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id.toString();

    if (targetId === currentId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already following?
    if (targetUser.followers.includes(currentId)) {
      return res.status(400).json({ message: "You already follow this user" });
    }

    targetUser.followers.push(currentId);
    currentUser.following.push(targetId);

    await targetUser.save();
    await currentUser.save();

    // Create a notification for the person being followed
    const notification = await Notification.create({
      recipient: targetId,
      sender: currentId,
      type: "follow",
    });

    const populatedNotification = await notification.populate("sender", "name avatar");
    emitToUser(targetId, "newNotification", populatedNotification);

    return res.status(200).json({ message: `You are now following ${targetUser.name}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/unfollow/:id
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id.toString();

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    targetUser.followers = targetUser.followers.filter(
      (followerId) => followerId.toString() !== currentId
    );
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== targetId
    );

    await targetUser.save();
    await currentUser.save();

    return res.status(200).json({ message: `You unfollowed ${targetUser.name}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { followUser, unfollowUser };