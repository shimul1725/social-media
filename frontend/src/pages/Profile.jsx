import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  fetchMyProfile,
  updateProfile,
  updateAboutInfo,
  uploadAvatar,
  uploadCoverPhoto,
} from "../api/userApi";
import { fetchUserPosts } from "../api/postApi";
import { getImageUrl } from "../utils/getImageUrl";
import PostCard from "../components/PostCard";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    work: "",
    education: "",
    livesIn: "",
    from: "",
    relationshipStatus: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("posts"); // posts | photos | about
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setForm({
        name: data.name,
        bio: data.bio || "",
        work: data.work || "",
        education: data.education || "",
        livesIn: data.livesIn || "",
        from: data.from || "",
        relationshipStatus: data.relationshipStatus || "",
        phone: data.phone || "",
      });
    } catch (err) {
      setMessage("Profile could not be loaded!");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (userId) => {
    setPostsLoading(true);
    try {
      const data = await fetchUserPosts(userId);
      setPosts(data);
    } catch (err) {
      // feed stays empty on failure
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile?._id) loadPosts(profile._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?._id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      await loadProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || "Image upload failed.");
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadCoverPhoto(file);
      await loadProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || "Image upload failed.");
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
      setMessage("Profile updated ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed!");
    } finally {
      setSaving(false);
    }
  };

  const handleAboutSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateAboutInfo({
        bio: form.bio,
        work: form.work,
        education: form.education,
        livesIn: form.livesIn,
        from: form.from,
        relationshipStatus: form.relationshipStatus,
        phone: form.phone,
      });
      await loadProfile();
      setEditingAbout(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed!");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  const handleUpdated = (updatedPost) => {
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  if (!profile) return <p style={{ textAlign: "center", marginTop: 50 }}>{message}</p>;

  const photoPosts = posts.filter((p) => p.image);
  const allPhotos = [
    ...(profile.avatar ? [{ _id: "avatar", url: profile.avatar, label: "Profile Picture" }] : []),
    ...(profile.coverPhoto ? [{ _id: "cover", url: profile.coverPhoto, label: "Cover Photo" }] : []),
    ...photoPosts.map((p) => ({ _id: p._id, url: p.image, label: "" })),
  ];

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
          Change cover
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
          <span className="avatar-edit-hint">Change</span>
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
            <span><strong>{profile.followers.length}</strong> Follower</span>
            <span><strong>{profile.following.length}</strong> Following</span>
            <Link to={`/friends/${profile._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <span><strong>{profile.friends?.length || 0}</strong> Friends</span>
            </Link>
          </div>
        </div>
      </div>

      {message && <p className="info-msg">{message}</p>}

      {!editing ? (
        <div className="profile-bio-section">
          <p className="profile-bio">{profile.bio || "No bio has been added"}</p>
          <button onClick={() => setEditing(true)}>Edit profile</button>
        </div>
      ) : (
        <form className="edit-profile-form" onSubmit={handleSave}>
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label>Bio</label>
          <textarea
            value={form.bio}
            maxLength={200}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Write something about yourself..."
          />
          <div className="edit-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>
              Cancelled
            </button>
          </div>
        </form>
      )}

      {/* ---------- Facebook-style Tabs ---------- */}
      <div className="profile-tabs">
        <button
          className={activeTab === "posts" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={activeTab === "photos" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("photos")}
        >
          Photos
        </button>
        <button
          className={activeTab === "about" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
      </div>

      <div className="profile-tab-content">
        {activeTab === "posts" && (
          postsLoading ? (
            <p className="info-msg">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="info-msg">এখনো কোনো পোস্ট নেই।</p>
          ) : (
            <div className="feed-page">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              ))}
            </div>
          )
        )}

        {activeTab === "photos" && (
          postsLoading ? (
            <p className="info-msg">Loading...</p>
          ) : allPhotos.length === 0 ? (
            <p className="info-msg">এখনো কোনো ছবি নেই।</p>
          ) : (
            <div className="photos-grid">
              {allPhotos.map((photo) => (
                <img
                  key={photo._id}
                  src={getImageUrl(photo.url)}
                  alt={photo.label || "post"}
                  className="photos-grid-item"
                  title={photo.label}
                />
              ))}
            </div>
          )
        )}

        {activeTab === "about" && (
          <div className="about-section">
            <div className="about-row">
              <strong>Email:</strong> <span>{profile.email}</span>
            </div>

            {!editingAbout ? (
              <>
                <div className="about-row">
                  <strong>Bio:</strong> <span>{profile.bio || "No bio has been added"}</span>
                </div>
                <div className="about-row">
                  <strong>💼 Work:</strong> <span>{profile.work || "Not added"}</span>
                </div>
                <div className="about-row">
                  <strong>🎓 Education:</strong> <span>{profile.education || "Not added"}</span>
                </div>
                <div className="about-row">
                  <strong>🏠 Lives in:</strong> <span>{profile.livesIn || "Not added"}</span>
                </div>
                <div className="about-row">
                  <strong>📍 From:</strong> <span>{profile.from || "Not added"}</span>
                </div>
                <div className="about-row">
                  <strong>❤️ Relationship Status:</strong>{" "}
                  <span>{profile.relationshipStatus || "Not added"}</span>
                </div>
                <div className="about-row">
                  <strong>📞 Phone:</strong> <span>{profile.phone || "Not added"}</span>
                </div>
                <div className="about-row">
                  <strong>Joined:</strong>{" "}
                  <span>{new Date(profile.createdAt).toLocaleDateString("en-GB")}</span>
                </div>

                <button className="about-edit-btn" onClick={() => setEditingAbout(true)}>
                  ✏️ Edit About Info
                </button>
              </>
            ) : (
              <form className="edit-profile-form" onSubmit={handleAboutSave}>
                <label>Bio</label>
                <textarea
                  value={form.bio}
                  maxLength={200}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Write something about yourself..."
                />

                <label>💼 Work</label>
                <input
                  type="text"
                  value={form.work}
                  onChange={(e) => setForm({ ...form, work: e.target.value })}
                  placeholder="e.g. Software Developer at ..."
                />

                <label>🎓 Education</label>
                <input
                  type="text"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  placeholder="e.g. Studies at ..."
                />

                <label>🏠 Lives in</label>
                <input
                  type="text"
                  value={form.livesIn}
                  onChange={(e) => setForm({ ...form, livesIn: e.target.value })}
                  placeholder="e.g. Dhaka, Bangladesh"
                />

                <label>📍 From</label>
                <input
                  type="text"
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  placeholder="e.g. Munshiganj, Dhaka"
                />

                <label>❤️ Relationship Status</label>
                <select
                  value={form.relationshipStatus}
                  onChange={(e) => setForm({ ...form, relationshipStatus: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Engaged">Engaged</option>
                  <option value="Married">Married</option>
                  <option value="It's complicated">It's complicated</option>
                </select>

                <label>📞 Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +880 1XXX-XXXXXX"
                />

                <div className="edit-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setEditingAbout(false);
                      setForm({
                        ...form,
                        bio: profile.bio || "",
                        work: profile.work || "",
                        education: profile.education || "",
                        livesIn: profile.livesIn || "",
                        from: profile.from || "",
                        relationshipStatus: profile.relationshipStatus || "",
                        phone: profile.phone || "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="profile-nav-links">
        <Link to="/dashboard">⬅ Return to Dashboard</Link>
      </div>
    </div>
  );
};

export default Profile;