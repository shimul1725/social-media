import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications, markNotificationsSeen } from "../api/notificationApi";
import { getImageUrl } from "../utils/getImageUrl";

const messageFor = (n) => {
  if (n.type === "follow") return "Followed you";
  if (n.type === "like") return "Liked your post";
  if (n.type === "comment") return "Commented on your post";
  if (n.type === "friend_request") return "Sent you a friend request.";
  if (n.type === "friend_accept") return "They have accepted your friend request.";
  return "";
};

const linkFor = (n) => {
  if (n.type === "follow") return `/users/${n.sender._id}`;
  if (n.type === "friend_request") return "/friend-requests";
  if (n.type === "friend_accept") return `/users/${n.sender._id}`;
  return "/feed"; // like/comment → simplest place to see the post is the feed
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then((data) => {
        setNotifications(data);
        return markNotificationsSeen();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="info-msg">Loading...</p>;

  return (
    <div className="notifications-page">
      <h2>Notification</h2>

      {notifications.length === 0 ? (
        <p className="info-msg">No notifications !</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <Link
              to={linkFor(n)}
              key={n._id}
              className={n.seen ? "notification-item" : "notification-item unseen"}
            >
              <img src={getImageUrl(n.sender.avatar)} alt={n.sender.name} />
              <p>
                <strong>{n.sender.name}</strong> {messageFor(n)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;