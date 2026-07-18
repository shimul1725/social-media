import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserProfile, followUser, unfollowUser } from "../api/userApi";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendStatus,
  cancelFriendRequest,
  unfriendUser as unfriendUserApi,
} from "../api/friendApi";
import { getImageUrl } from "../utils/getImageUrl";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [friendStatus, setFriendStatus] = useState("none");
  const [requestId, setRequestId] = useState(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

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

  const loadFriendStatus = async () => {
    try {
      const data = await getFriendStatus(id);
      setFriendStatus(data.status);
      setRequestId(data.requestId || null);
    } catch (err) {
      // silently ignore
    }
  };

  useEffect(() => {
    loadProfile();
    loadFriendStatus();
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

  const handleSendFriendRequest = async () => {
    setFriendActionLoading(true);
    try {
      await sendFriendRequest(id);
      await loadFriendStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || "রিকোয়েস্ট পাঠানো যায়নি");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    setFriendActionLoading(true);
    try {
      await acceptFriendRequest(requestId);
      await loadFriendStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || "একসেপ্ট করা যায়নি");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setFriendActionLoading(true);
    try {
      await cancelFriendRequest(requestId);
      await loadFriendStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || "ক্যানসেল করা যায়নি");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!window.confirm(`আপনি কি সত্যিই ${profile.name}-কে Unfriend করতে চান?`)) return;
    setFriendActionLoading(true);
    try {
      await unfriendUserApi(id);
      await loadFriendStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unfriend করা যায়নি");
    } finally {
      setFriendActionLoading(false);
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
            <Link to={`/friends/${profile._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <span><strong>{profile.friends?.length || 0}</strong> Friends</span>
            </Link>
          </div>

          {currentUser?._id !== profile._id && (
            <div className="profile-action-buttons" style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
              <button
                className={isFollowing ? "unfollow-btn" : "follow-btn"}
                onClick={handleFollowToggle}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : isFollowing ? "আনফলো" : "ফলো করুন"}
              </button>

              {friendStatus === "none" && (
                <button className="add-friend-btn" onClick={handleSendFriendRequest} disabled={friendActionLoading}>
                  {friendActionLoading ? "..." : "+ Add Friend"}
                </button>
              )}

              {friendStatus === "request_sent" && (
                <button className="request-sent-btn" onClick={handleCancelRequest} disabled={friendActionLoading}>
                  {friendActionLoading ? "..." : "✕ Cancel Request"}
                </button>
              )}

              {friendStatus === "request_received" && (
                <button className="accept-friend-btn" onClick={handleAcceptFriendRequest} disabled={friendActionLoading}>
                  {friendActionLoading ? "..." : "✓ Accept Request"}
                </button>
              )}

              {friendStatus === "friends" && (
                <button className="friends-btn" onClick={handleUnfriend} disabled={friendActionLoading}>
                  {friendActionLoading ? "..." : "✓ Friends ▾"}
                </button>
              )}
            </div>
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