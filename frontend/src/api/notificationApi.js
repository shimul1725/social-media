import API from "./axios";

// Get all notifications for the logged-in user
export const fetchNotifications = async () => {
  const { data } = await API.get("/notifications");
  return data;
};

// Mark all notifications as seen
export const markNotificationsSeen = async () => {
  const { data } = await API.put("/notifications/seen");
  return data;
};