// The backend serves uploaded images from its root (not under /api),
// so we strip "/api" off the configured API URL to get the server's base URL.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE_URL = API_URL.replace(/\/api\/?$/, "");

// Builds a full, browser-loadable URL for an avatar/cover path like "/uploads/avatar-123.jpg".
// Falls back to a simple placeholder if no image is set.
export const getImageUrl = (path) => {
  if (!path) return "https://placehold.co/300x300?text=No+Image";
  return `${SERVER_BASE_URL}${path}`;
};