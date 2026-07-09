import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  fetchMyProfile,
  updateProfile,
  uploadAvatar,
  uploadCoverPhoto,
} from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setForm({ name: data.name, bio: data.bio || "" });
    } catch (err) {
      setMessage("প্রোফাইল লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      await loadProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || "ছবি আপলোড ব্যর্থ হয়েছে");
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadCoverPhoto(file);
      await loadProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || "ছবি আপলোড ব্যর্থ হয়েছে");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(form.name, form.bio);
      await loadProfile();
      setEditing(false);
      setMessage("প্রোফাইল আপডেট হয়েছে ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>লোড হচ্ছে...</p>;
  if (!profile) return <p style={{ textAlign: "center", marginTop: 50 }}>{message}</p>;

  return (
    <div className="profile-page">
      <div
        className="profile-cover"
        style={{ backgroundImage: `url(${getImageUrl(profile.coverPhoto)})` }}
      >
        <button
          className="change-cover-btn"
          onClick={() => coverInputRef.current.click()}
        >
          কভার পরিবর্তন করুন
        </button>
        <input
          type="file"
          accept="image/*"
          ref={coverInputRef}
          style={{ display: "none" }}
          onChange={handleCoverChange}
        />
      </div>

      <div className="profile-header">
        <div
          className="avatar-wrapper"
          onClick={() => avatarInputRef.current.click()}
        >
          <img
            src={getImageUrl(profile.avatar)}
            alt="avatar"
            className="profile-avatar"
          />
          <span className="avatar-edit-hint">পরিবর্তন করুন</span>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />

        <div className="profile-info">
          <h2>{profile.name}</h2>
          <p className="profile-email">{profile.email}</p>
          <div className="follow-counts">
            <span><strong>{profile.followers.length}</strong> ফলোয়ার</span>
            <span><strong>{profile.following.length}</strong> ফলোয়িং</span>
          </div>
        </div>
      </div>

      {message && <p className="info-msg">{message}</p>}

      {!editing ? (
        <div className="profile-bio-section">
          <p className="profile-bio">{profile.bio || "কোনো বায়ো যোগ করা হয়নি।"}</p>
          <button onClick={() => setEditing(true)}>প্রোফাইল এডিট করুন</button>
        </div>
      ) : (
        <form className="edit-profile-form" onSubmit={handleSave}>
          <label>নাম</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label>বায়ো</label>
          <textarea
            value={form.bio}
            maxLength={200}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="নিজের সম্পর্কে কিছু লিখুন..."
          />
          <div className="edit-actions">
            <button type="submit" disabled={saving}>
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>
              বাতিল
            </button>
          </div>
        </form>
      )}

      <div className="profile-nav-links">
        <Link to="/dashboard">⬅ ড্যাশবোর্ডে ফিরুন</Link>
      </div>
    </div>
  );
};

export default Profile;