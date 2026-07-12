const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "social-media-app", // all uploads go into this folder on Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    // Cloudinary needs a unique public_id per file, similar to our old filename logic
    public_id: (req, file) => {
      const fieldName = file.fieldname; // "avatar", "coverPhoto", or "image"
      const userId = req.user?._id || "unknown";
      return `${fieldName}-${userId}-${Date.now()}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;