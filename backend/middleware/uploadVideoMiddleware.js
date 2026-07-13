const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "social-media-app/videos",
    resource_type: "video", // tells Cloudinary this is a video, not an image
    allowed_formats: ["mp4", "mov", "webm", "avi"],
    public_id: (req, file) => {
      const userId = req.user?._id || "unknown";
      return `video-${userId}-${Date.now()}`;
    },
  },
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for videos
});

module.exports = uploadVideo;