const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentComment || null,
    });

    const populatedComment = await comment.populate("user", "name avatar");

    // Notify the post's owner (unless they're commenting on their own post)
    const post = await Post.findById(req.params.id);
    if (post && post.user.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
      });

      const populatedNotification = await notification.populate("sender", "name avatar");
      emitToUser(post.user.toString(), "newNotification", populatedNotification);
    }

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const allComments = await Comment.find({ post: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: 1 });

    // Split into top-level comments and replies, then attach each reply
    // to its parent so the frontend can render them nested.
    const topLevel = allComments.filter((c) => !c.parentComment);
    const replies = allComments.filter((c) => c.parentComment);

    const nested = topLevel.map((comment) => ({
      ...comment.toObject(),
      replies: replies.filter(
        (r) => r.parentComment.toString() === comment._id.toString()
      ),
    }));

    return res.status(200).json(nested);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a comment (only by the comment's owner)
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addComment, getComments, deleteComment };