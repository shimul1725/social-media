import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchConversationsList } from "../api/messageApi";
import { searchUsers } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";
import { useSocket } from "../context/SocketContext";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useSocket();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchConversationsList()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Debounced search — waits 300ms after typing stops before calling the API
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      searchUsers(query.trim())
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (loading) return <p className="info-msg">লোড হচ্ছে...</p>;

  const showingSearch = query.trim().length > 0;

  return (
    <div className="inbox-page">
      <h2>মেসেজ</h2>

      <div className="inbox-search-wrapper">
          <span className="inbox-search-icon">🔍</span>
         <input
            type="text"
            className="inbox-search-input"
            placeholder="কাউকে খুঁজে মেসেজ পাঠান..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
         />
      </div>

      {showingSearch ? (
        searching ? (
          <p className="info-msg">খুঁজছি...</p>
        ) : searchResults.length === 0 ? (
          <p className="info-msg">কেউ খুঁজে পাওয়া যায়নি</p>
        ) : (
          <div className="conversations-list">
            {searchResults.map((person) => (
              <Link to={`/chat/${person._id}`} key={person._id} className="conversation-item">
                <div className="conversation-avatar-wrapper">
                  <img src={getImageUrl(person.avatar)} alt={person.name} />
                  {onlineUsers.includes(person._id) && <span className="online-dot" />}
                </div>
                <div className="conversation-info">
                  <strong>{person.name}</strong>
                  <p>মেসেজ পাঠাতে ক্লিক করুন</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : conversations.length === 0 ? (
        <p className="info-msg">
          এখনো কোনো কথোপকথন নেই। উপরে খুঁজে কারো সাথে মেসেজ শুরু করুন।
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