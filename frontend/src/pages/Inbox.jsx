import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchConversationsList } from "../api/messageApi";
import { getImageUrl } from "../utils/getImageUrl";
import { useSocket } from "../context/SocketContext";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    fetchConversationsList()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="info-msg">লোড হচ্ছে...</p>;

  return (
    <div className="inbox-page">
      <h2>মেসেজ</h2>

      {conversations.length === 0 ? (
        <p className="info-msg">
          এখনো কোনো কথোপকথন নেই। কারো প্রোফাইলে গিয়ে মেসেজ পাঠিয়ে শুরু করুন।
        </p>
      ) : (
        <div className="conversations-list">
          {conversations.map((conv) => (
            <Link
              to={`/chat/${conv.user._id}`}
              key={conv.user._id}
              className="conversation-item"
            >
              <div className="conversation-avatar-wrapper">
                <img src={getImageUrl(conv.user.avatar)} alt={conv.user.name} />
                {onlineUsers.includes(conv.user._id) && (
                  <span className="online-dot" />
                )}
              </div>
              <div className="conversation-info">
                <strong>{conv.user.name}</strong>
                <p className={conv.unseen ? "unseen-message" : ""}>
                  {conv.lastMessage}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;