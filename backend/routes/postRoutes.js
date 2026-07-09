const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createPost,
  getFeed,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
} = require("../controllers/postController");

const { addComment, getComments, deleteComment } = require("../controllers/commentController");

// Create a post (optionally with one image)
router.post("/", protect, upload.single("image"), createPost);

// Get the news feed
router.get("/", protect, getFeed);

// Get a specific user's posts (must come before "/:id")
router.get("/user/:userId", protect, getUserPosts);

// Update / delete a specific post
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Like / unlike a post
router.put("/:id/like", protect, toggleLike);

// Comments on a post
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, getComments);

// Delete a specific comment
router.delete("/comments/:commentId", protect, deleteComment);

module.exports = router;