const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.files?.image ? req.files.image[0].path : "";
    const video = req.files?.video ? req.files.video[0].path : "";

    if (!text && !image && !video) {
      return res.status(400).json({ message: "Post must have text, an image, or a video" });
    }

    const post = await Post.create({
      user: req.user._id,
      text: text || "",
      image,
      video,
    });

    const populatedPost = await post.populate("user", "name avatar");

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Share an existing post
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    // Don't allow sharing a post that is itself already a share
    const rootPostId = originalPost.sharedPost || originalPost._id;

    const { text } = req.body;

    const sharedPost = await Post.create({
      user: req.user._id,
      text: text || "",
      sharedPost: rootPostId,
    });

    const populatedPost = await sharedPost.populate([
      { path: "user", select: "name avatar" },
      {
        path: "sharedPost",
        populate: { path: "user", select: "name avatar" },
      },
    ]);

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get news feed (all posts, newest first)
// @route   GET /api/posts
// @access  Private
const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
       .populate("user", "name avatar")
       .populate({
       path: "sharedPost",
       populate: { path: "user", select: "name avatar" },
       })
       .sort({ createdAt: -1 })
       .limit(50);

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all posts by a specific user
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "name avatar")
      .populate({
       path: "sharedPost",
       populate: { path: "user", select: "name avatar" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a post's text (only by the post's owner)
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    post.text = req.body.text ?? post.text;
    await post.save();

    const populatedPost = await post.populate("user", "name avatar");
    return res.status(200).json(populatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a post (only by the post's owner)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // Only notify when liking (not unliking), and never notify yourself
    if (!alreadyLiked && post.user.toString() !== userId) {
      const notification = await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "like",
        post: post._id,
      });

      const populatedNotification = await notification.populate("sender", "name avatar");
      emitToUser(post.user.toString(), "newNotification", populatedNotification);
    }

    return res.status(200).json({
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Save or unsave a post (toggle)
// @route   PUT /api/posts/:id/save
// @access  Private
const toggleSave = async (req, res) => {
  try {
    const User = require("../models/User");
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user._id);
    const postId = req.params.id;
    const alreadySaved = user.savedPosts.some((id) => id.toString() === postId);

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();

    return res.status(200).json({ saved: !alreadySaved });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all posts the logged-in user has saved
// @route   GET /api/posts/saved/me
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: { path: "user", select: "name avatar" },
    });

    return res.status(200).json(user.savedPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  getSavedPosts,
  sharePost,
};