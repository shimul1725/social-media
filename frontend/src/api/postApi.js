import API from "./axios";

// Create a new post (text and/or image)
export const createPost = async (text, imageFile) => {
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (imageFile) formData.append("image", imageFile);

  const { data } = await API.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Get the news feed (all posts, newest first)
export const fetchFeed = async () => {
  const { data } = await API.get("/posts");
  return data;
};

// Get all posts by a specific user
export const fetchUserPosts = async (userId) => {
  const { data } = await API.get(`/posts/user/${userId}`);
  return data;
};

// Update a post's text
export const updatePost = async (postId, text) => {
  const { data } = await API.put(`/posts/${postId}`, { text });
  return data;
};

// Delete a post
export const deletePost = async (postId) => {
  const { data } = await API.delete(`/posts/${postId}`);
  return data;
};

// Like or unlike a post (toggle)
export const toggleLike = async (postId) => {
  const { data } = await API.put(`/posts/${postId}/like`);
  return data;
};

// Add a comment to a post
export const addComment = async (postId, text, parentComment = null) => {
  const { data } = await API.post(`/posts/${postId}/comments`, {
    text,
    parentComment,
  });
  return data;
};

// Get all comments for a post
export const fetchComments = async (postId) => {
  const { data } = await API.get(`/posts/${postId}/comments`);
  return data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const { data } = await API.delete(`/posts/comments/${commentId}`);
  return data;
};
// Save or unsave a post (toggle)
export const toggleSave = async (postId) => {
  const { data } = await API.put(`/posts/${postId}/save`);
  return data;
};

// Get all posts the logged-in user has saved
export const fetchSavedPosts = async () => {
  const { data } = await API.get("/posts/saved/me");
  return data;
};

// Share an existing post (optionally with your own caption text)
export const sharePost = async (postId, text = "") => {
  const { data } = await API.post(`/posts/${postId}/share`, { text });
  return data;
};