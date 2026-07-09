const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  sendMessage,
  getConversation,
  getConversationsList,
} = require("../controllers/messageController");

// Send a message
router.post("/", protect, sendMessage);

// Get inbox list (must come before "/:userId")
router.get("/", protect, getConversationsList);

// Get full conversation with a specific user
router.get("/:userId", protect, getConversation);

module.exports = router;