import API from "./axios";

// Send a friend request
export const sendFriendRequest = async (userId) => {
  const { data } = await API.put(`/friends/request/${userId}`);
  return data;
};

// Accept a friend request
export const acceptFriendRequest = async (requestId) => {
  const { data } = await API.put(`/friends/accept/${requestId}`);
  return data;
};

// Get friend status with another user (none / request_sent / request_received / friends)
export const getFriendStatus = async (userId) => {
  const { data } = await API.get(`/friends/status/${userId}`);
  return data;
};
// Get another user's friends list by their ID
export const fetchFriendsListByUserId = async (userId) => {
  const { data } = await API.get(`/friends/list/${userId}`);
  return data;
};
// Reject/delete a friend request
export const rejectFriendRequest = async (requestId) => {
  const { data } = await API.delete(`/friends/reject/${requestId}`);
  return data;
};
// Get pending friend requests (for navbar badge count)
export const fetchPendingFriendRequests = async () => {
  const { data } = await API.get("/friends/requests");
  return data;
};
// Cancel a sent friend request
export const cancelFriendRequest = async (requestId) => {
  const { data } = await API.delete(`/friends/cancel/${requestId}`);
  return data;
};

// Unfriend a user
export const unfriendUser = async (userId) => {
  const { data } = await API.put(`/friends/unfriend/${userId}`);
  return data;
};