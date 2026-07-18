const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

// @desc    Send a friend request
// @route   PUT /api/friends/request/:id
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id.toString();

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const reverseRequest = await FriendRequest.findOne({
      sender: receiverId,
      receiver: senderId,
      status: "pending",
    });
    if (reverseRequest) {
      return res.status(400).json({
        message: "This user already sent you a friend request. Accept it instead.",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    const notification = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "friend_request",
    });

    const populatedNotification = await notification.populate("sender", "name avatar");
    emitToUser(receiverId, "newNotification", populatedNotification);

    return res.status(201).json({ message: "Friend request sent", friendRequest });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Accept a friend request
// @route   PUT /api/friends/accept/:requestId
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentId = req.user._id.toString();

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.receiver.toString() !== currentId) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request has already been handled" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
    await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });

    const notification = await Notification.create({
      recipient: request.sender,
      sender: currentId,
      type: "friend_accept",
    });

    const populatedNotification = await notification.populate("sender", "name avatar");
    emitToUser(request.sender.toString(), "newNotification", populatedNotification);

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject (delete) a friend request
// @route   DELETE /api/friends/reject/:requestId
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentId = req.user._id.toString();

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.receiver.toString() !== currentId) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }

    await request.deleteOne();

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Cancel a friend request you sent
// @route   DELETE /api/friends/cancel/:requestId
// @access  Private
const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentId = req.user._id.toString();

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.sender.toString() !== currentId) {
      return res.status(403).json({ message: "You are not authorized to cancel this request" });
    }

    await request.deleteOne();

    return res.status(200).json({ message: "Friend request cancelled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Unfriend a user
// @route   PUT /api/friends/unfriend/:id
// @access  Private
const unfriendUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id.toString();

    await User.findByIdAndUpdate(currentId, { $pull: { friends: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { friends: currentId } });

    await FriendRequest.deleteMany({
      $or: [
        { sender: currentId, receiver: targetId },
        { sender: targetId, receiver: currentId },
      ],
    });

    return res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get pending friend requests received by the logged-in user
// @route   GET /api/friends/requests
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get the logged-in user's friends list
// @route   GET /api/friends/list
// @access  Private
const getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "name avatar bio");
    return res.status(200).json(user.friends);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get any user's friends list by their ID
// @route   GET /api/friends/list/:id
// @access  Private
const getFriendsListByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("friends", "name avatar bio");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.friends);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get friend status between logged-in user and another user
// @route   GET /api/friends/status/:id
// @access  Private
const getFriendStatus = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id.toString();

    const currentUser = await User.findById(currentId);
    if (currentUser.friends.includes(targetId)) {
      return res.status(200).json({ status: "friends" });
    }

    const sentRequest = await FriendRequest.findOne({
      sender: currentId,
      receiver: targetId,
      status: "pending",
    });
    if (sentRequest) {
      return res.status(200).json({ status: "request_sent", requestId: sentRequest._id });
    }

    const receivedRequest = await FriendRequest.findOne({
      sender: targetId,
      receiver: currentId,
      status: "pending",
    });
    if (receivedRequest) {
      return res.status(200).json({ status: "request_received", requestId: receivedRequest._id });
    }

    return res.status(200).json({ status: "none" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriendUser,
  getPendingRequests,
  getFriendsList,
  getFriendsListByUserId,
  getFriendStatus,
};