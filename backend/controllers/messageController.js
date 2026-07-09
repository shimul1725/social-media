const Message = require("../models/Message");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({ message: "receiverId and text are required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
    });

    const populatedMessage = await message.populate("sender", "name avatar");

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get the full conversation between the logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    // Mark all messages sent TO me in this conversation as seen
    await Message.updateMany(
      { sender: otherId, receiver: myId, seen: false },
      { seen: true }
    );

    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a list of people the user has chatted with (inbox list)
// @route   GET /api/messages
// @access  Private
const getConversationsList = async (req, res) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: -1 });

    // Build a unique list of "the other person" from each message,
    // keeping only the most recent message per person.
    const conversationsMap = new Map();

    for (const msg of messages) {
      const otherUser =
        msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherUser._id.toString())) {
        conversationsMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unseen: msg.receiver._id.toString() === myId.toString() && !msg.seen,
        });
      }
    }

    return res.status(200).json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { sendMessage, getConversation, getConversationsList };