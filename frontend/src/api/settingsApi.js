import API from "./axios";

// Change password (requires current password for verification)
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await API.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
};

// Permanently delete the logged-in user's account (requires password confirmation)
export const deleteAccount = async (password) => {
  const { data } = await API.delete("/auth/delete-account", {
    data: { password },
  });
  return data;
};

// Toggle account privacy (public/private)
export const updatePrivacy = async (isPrivate) => {
  const { data } = await API.put("/users/privacy", { isPrivate });
  return data;
};