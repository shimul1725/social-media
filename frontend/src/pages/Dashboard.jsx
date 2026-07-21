import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { fetchMyProfile } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";
import Feed from "./Feed";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchMyProfile();
        setProfile(data);
      } catch (err) {
        // ignore — page still works without extra profile stats
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="home-container">
      <div
         className="welcome-banner"
         style={{ backgroundImage: `url(${getImageUrl(profile?.coverPhoto)})` }}
      >
      <div className="welcome-overlay" />
      <img
          src={getImageUrl(profile?.avatar)}
          alt="avatar"
    className="welcome-avatar"
  />
  <div className="welcome-text">
    <h2>Welcome, {user?.name} 👋</h2>
    <p>{profile?.bio || "How is your day going?"}</p>
  </div>
</div>

    {profile && (
  <div className="stats-row">
    <Link to={`/connections/followers/${profile._id}`} className="stat-card">
      <strong>{profile.followers?.length || 0}</strong>
      <span>Followers</span>
    </Link>
    <Link to={`/connections/following/${profile._id}`} className="stat-card">
      <strong>{profile.following?.length || 0}</strong>
      <span>Following</span>
    </Link>
    <Link to={`/friends/${profile._id}`} className="stat-card">
      <strong>{profile.friends?.length || 0}</strong>
      <span>Friends</span>
    </Link>
  </div>
)}

      <div className="quick-links">
        <Link to="/profile" className="quick-link-card">
          <span className="quick-link-icon">👤</span>
          <div>
            <strong>My Profile</strong>
            <p>View and Edit Profile</p>
          </div>
        </Link>

        <Link to="/search" className="quick-link-card">
          <span className="quick-link-icon">🔍</span>
          <div>
            <strong>Find people</strong>
            <p>Find and follow new friends</p>
          </div>
        </Link>
      </div>

         <div className="dashboard-feed-section">
          <Feed />
        </div>
    </div>
  );
};

export default Dashboard;