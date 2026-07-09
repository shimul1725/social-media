const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getMyProfile,
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  searchUsers,
} = require("../controllers/userController");

const { followUser, unfollowUser } = require("../controllers/followController");

// Profile
router.get("/profile/me", protect, getMyProfile);
router.put("/profile", protect, updateProfile);
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/cover", protect, upload.single("coverPhoto"), updateCoverPhoto);

// Search (must come before "/:id" so "search" isn't treated as an ID)
router.get("/search", protect, searchUsers);

// Follow system
router.put("/follow/:id", protect, followUser);
router.put("/unfollow/:id", protect, unfollowUser);

// Get any user's public profile (keep this LAST since ":id" matches almost anything)
router.get("/:id", protect, getUserProfile);

module.exports = router;