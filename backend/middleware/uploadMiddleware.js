const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.fieldname === "video";
    return {
      folder: isVideo ? "social-media-app/videos" : "social-media-app",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov", "webm", "avi"]
        : ["jpg", "jpeg", "png", "webp", "gif"],
      public_id: `${file.fieldname}-${req.user?._id || "unknown"}-${Date.now()}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (covers both images and videos)
});

module.exports = upload;