import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchMyProfile } from "../api/userApi";
import { changePassword, deleteAccount, updatePrivacy } from "../api/settingsApi";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isPrivate, setIsPrivate] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    fetchMyProfile()
      .then((data) => setIsPrivate(!!data.isPrivate))
      .catch(() => {});
  }, []);

  const handlePrivacyToggle = async () => {
    setPrivacyLoading(true);
    setPrivacyMsg("");
    try {
      const data = await updatePrivacy(!isPrivate);
      setIsPrivate(data.isPrivate);
      setPrivacyMsg(
        data.isPrivate
          ? "✅ আপনার অ্যাকাউন্ট এখন Private"
          : "✅ আপনার অ্যাকাউন্ট এখন Public"
      );
    } catch (err) {
      setPrivacyMsg(err.response?.data?.message || "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg("✅ পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || "পাসওয়ার্ড পরিবর্তন করা যায়নি");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteMsg("");
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteMsg(err.response?.data?.message || "অ্যাকাউন্ট মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>সেটিংস</h2>

      {/* ---------- Privacy Section ---------- */}
      <div className="settings-card">
        <h3>🔒 প্রাইভেসি</h3>
        <div className="privacy-toggle-row">
          <div>
            <strong>{isPrivate ? "Private Account" : "Public Account"}</strong>
            <p>
              {isPrivate
                ? "শুধু ফ্রেন্ডরা আপনার প্রোফাইল সম্পূর্ণভাবে দেখতে পারবে"
                : "সবাই আপনার প্রোফাইল দেখতে পারবে"}
            </p>
          </div>
          <button
            className={isPrivate ? "toggle-switch on" : "toggle-switch"}
            onClick={handlePrivacyToggle}
            disabled={privacyLoading}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {privacyMsg && <p className="info-msg">{privacyMsg}</p>}
      </div>

      {/* ---------- Change Password Section ---------- */}
      <div className="settings-card">
        <h3>🔑 পাসওয়ার্ড পরিবর্তন</h3>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <label>বর্তমান পাসওয়ার্ড</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <label>নতুন পাসওয়ার্ড</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <button type="submit" disabled={passwordSaving}>
            {passwordSaving ? "সেভ হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
          </button>
        </form>
        {passwordMsg && <p className="info-msg">{passwordMsg}</p>}
      </div>

      {/* ---------- Danger Zone ---------- */}
      <div className="settings-card danger-zone">
        <h3>⚠️ অ্যাকাউন্ট ডিলিট</h3>
        <p>এই কাজটি স্থায়ী — একবার ডিলিট করলে ফিরিয়ে আনা যাবে না।</p>

        {!showDeleteConfirm ? (
          <button className="danger-btn" onClick={() => setShowDeleteConfirm(true)}>
            অ্যাকাউন্ট ডিলিট করুন
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="settings-form">
            <label>নিশ্চিত করতে পাসওয়ার্ড দিন</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
            <div className="edit-actions">
              <button type="submit" className="danger-btn" disabled={deleting}>
                {deleting ? "ডিলিট হচ্ছে..." : "নিশ্চিতভাবে ডিলিট করুন"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteMsg("");
                }}
              >
                বাতিল
              </button>
            </div>
          </form>
        )}
        {deleteMsg && <p className="info-msg">{deleteMsg}</p>}
      </div>

      <div className="profile-nav-links">
        <Link to="/dashboard">⬅ ড্যাশবোর্ডে ফিরুন</Link>
      </div>
    </div>
  );
};

export default Settings;