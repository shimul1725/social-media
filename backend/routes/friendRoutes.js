const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  unfriendUser,
  getPendingRequests,
  getFriendsList,
  getFriendsListByUserId,
  getFriendStatus,
} = require("../controllers/friendController");

router.put("/request/:id", protect, sendFriendRequest);
router.put("/accept/:requestId", protect, acceptFriendRequest);
router.put("/unfriend/:id", protect, unfriendUser);
router.delete("/reject/:requestId", protect, rejectFriendRequest);
router.delete("/cancel/:requestId", protect, cancelFriendRequest);
router.get("/requests", protect, getPendingRequests);
router.get("/list", protect, getFriendsList);
router.get("/status/:id", protect, getFriendStatus);
router.get("/list/:id", protect, getFriendsListByUserId); // keep LAST since ":id" matches almost anything

module.exports = router;