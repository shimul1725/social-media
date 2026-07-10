const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAllAsSeen,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.put("/seen", protect, markAllAsSeen);

module.exports = router;