import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyProfile } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!user) return;
    const loadAvatar = async () => {
      try {
        const data = await fetchMyProfile();
        setAvatar(data.avatar);
      } catch (err) {
        // silently ignore — navbar just won't show an avatar
      }
    };
    loadAvatar();
  }, [user]);

  if (!user) return null; // Login/Register পেজে navbar দেখাবে না

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        📘 SocialApp
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard">হোম</Link>
        <Link to="/feed">📰 ফিড</Link>
        <Link to="/search">🔍 খুঁজুন</Link>
        <Link to="/profile" className="navbar-profile">
          <img src={getImageUrl(avatar)} alt="avatar" className="navbar-avatar" />
          <span>{user.name}</span>
        </Link>
        <button className="navbar-logout" onClick={handleLogout}>
          লগআউট
        </button>
      </div>
    </nav>
  );
};

export default Navbar;