import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyProfile } from "../api/userApi";
import { fetchNotifications } from "../api/notificationApi";
import { useSocket } from "../context/SocketContext";
import { getImageUrl } from "../utils/getImageUrl";
import { fetchPendingFriendRequests } from "../api/friendApi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const { socket } = useSocket();
  const [unseenCount, setUnseenCount] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
  if (!user) return;

  fetchNotifications()
    .then((data) => {
      setUnseenCount(data.filter((n) => !n.seen).length);
    })
    .catch(() => {});
}, [user]);

useEffect(() => {
  if (!user) return;
  fetchPendingFriendRequests()
    .then((data) => setPendingFriendCount(data.length))
    .catch(() => {});
}, [user]);

useEffect(() => {
  if (!socket) return;
  const handleNewNotification = (notification) => {
    setUnseenCount((prev) => prev + 1);
    if (notification.type === "friend_request") {
      setPendingFriendCount((prev) => prev + 1);
    }
  };
  socket.on("newNotification", handleNewNotification);
  return () => {
    socket.off("newNotification", handleNewNotification);
  };
}, [socket]);

  if (!user) return null; // Login/Register পেজে navbar দেখাবে না

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    
      <nav className="navbar">
         <Link to="/dashboard" className="navbar-logo">
            <img src="/bondhu-logo.jpg" alt="Bondhu" className="navbar-logo-img" />
             Bondhu
          </Link>

      <button
         className="navbar-hamburger"
         onClick={() => setMenuOpen(!menuOpen)}
         aria-label="Menu"
       >
         ☰
       </button>

 <div className={menuOpen ? "navbar-links open" : "navbar-links"}>
  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>হোম</Link>
  <Link to="/feed" onClick={() => setMenuOpen(false)}>📰 ফিড</Link>
  <Link to="/saved" onClick={() => setMenuOpen(false)}>🔖 সেভ করা</Link>
  <Link to="/inbox" onClick={() => setMenuOpen(false)}>💬 মেসেজ</Link>
  <Link to="/search" onClick={() => setMenuOpen(false)}>🔍 খুঁজুন</Link>
  <Link
    to="/friend-requests"
    className="navbar-bell"
    onClick={() => {
    setMenuOpen(false);
   }}
  >
    👥
    {pendingFriendCount > 0 && <span className="notification-badge">{pendingFriendCount}</span>}
 </Link>
  <Link
    to="/notifications"
    className="navbar-bell"
    onClick={() => {
      setUnseenCount(0);
      setMenuOpen(false);
    }}
  >
    🔔
    {unseenCount > 0 && <span className="notification-badge">{unseenCount}</span>}
  </Link>
  <Link to="/profile" className="navbar-profile" onClick={() => setMenuOpen(false)}>
    <img src={getImageUrl(avatar)} alt="avatar" className="navbar-avatar" />
    <span>{user.name}</span>
  </Link>
  <button
    className="navbar-logout"
    onClick={() => {
      handleLogout();
      setMenuOpen(false);
    }}
  >
    লগআউট
  </button>
</div>
    </nav>
  );
};

export default Navbar;