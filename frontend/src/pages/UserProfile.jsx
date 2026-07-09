import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserProfile, followUser, unfollowUser } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProfile(id);
      setProfile(data);
    } catch (err) {
      setMessage("এই ইউজার খুঁজে পাওয়া যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isFollowing =
    profile?.followers?.some((f) => f._id === currentUser?._id) || false;

  const handleFollowToggle = async () => {
    setActionLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }
      await loadProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>লোড হচ্ছে...</p>;
  if (!profile) return <p style={{ textAlign: "center", marginTop: 50 }}>{message}</p>;

  return (
    <div className="profile-page">
      <div
        className="profile-cover"
        style={{ backgroundImage: `url(${getImageUrl(profile.coverPhoto)})` }}
      />

      <div className="profile-header">
        <img src={getImageUrl(profile.avatar)} alt="avatar" className="profile-avatar" />

        <div className="profile-info">
          <h2>{profile.name}</h2>
          <div className="follow-counts">
            <span><strong>{profile.followers.length}</strong> ফলোয়ার</span>
            <span><strong>{profile.following.length}</strong> ফলোয়িং</span>
          </div>

          {currentUser?._id !== profile._id && (
            <button
              className={isFollowing ? "unfollow-btn" : "follow-btn"}
              onClick={handleFollowToggle}
              disabled={actionLoading}
            >
              {actionLoading ? "..." : isFollowing ? "আনফলো" : "ফলো করুন"}
            </button>
          )}
        </div>
      </div>

      {message && <p className="info-msg">{message}</p>}

      <div className="profile-bio-section">
        <p className="profile-bio">{profile.bio || "কোনো বায়ো যোগ করা হয়নি।"}</p>
      </div>

      <div className="profile-nav-links">
        <Link to="/search">🔍 মানুষ খুঁজুন</Link>
        <Link to="/dashboard">⬅ ড্যাশবোর্ডে ফিরুন</Link>
      </div>
    </div>
  );
};

export default UserProfile;