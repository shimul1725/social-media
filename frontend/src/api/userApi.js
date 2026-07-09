import API from "./axios";

// Get logged-in user's full profile (with followers/following populated)
export const fetchMyProfile = async () => {
  const { data } = await API.get("/users/profile/me");
  return data;
};

// Get another user's public profile by ID
export const fetchUserProfile = async (userId) => {
  const { data } = await API.get(`/users/${userId}`);
  return data;
};

// Update name / bio
export const updateProfile = async (name, bio) => {
  const { data } = await API.put("/users/profile", { name, bio });
  return data;
};

// Upload avatar (expects a File object)
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await API.put("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Upload cover photo (expects a File object)
export const uploadCoverPhoto = async (file) => {
  const formData = new FormData();
  formData.append("coverPhoto", file);
  const { data } = await API.put("/users/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Search users by name
export const searchUsers = async (query) => {
  const { data } = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
  return data;
};

// Follow a user
export const followUser = async (userId) => {
  const { data } = await API.put(`/users/follow/${userId}`);
  return data;
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  const { data } = await API.put(`/users/unfollow/${userId}`);
  return data;
};