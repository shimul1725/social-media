import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchConversation, sendMessageAPI } from "../api/messageApi";
import { fetchUserProfile } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const ChatWindow = () => {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversation history + the other person's profile
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchConversation(userId), fetchUserProfile(userId)])
      .then(([msgs, profile]) => {
        setMessages(msgs);
        setOtherUser(profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  // Listen for real-time incoming messages / typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      if (msg.senderId === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === userId) setOtherUserTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === userId) setOtherUserTyping(false);
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
    };
  }, [socket, userId]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTypingInput = (e) => {
    setText(e.target.value);
    if (!socket) return;

    socket.emit("typing", { senderId: me._id, receiverId: userId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: me._id, receiverId: userId });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const saved = await sendMessageAPI(userId, trimmed);

      setMessages((prev) => [...prev, saved]);
      setText("");

      socket?.emit("sendMessage", {
        senderId: me._id,
        receiverId: userId,
        text: trimmed,
        _id: saved._id,
        createdAt: saved.createdAt,
        sender: saved.sender,
      });

      socket?.emit("stopTyping", { senderId: me._id, receiverId: userId });
    } catch (err) {
      alert(err.response?.data?.message || "মেসেজ পাঠানো যায়নি");
    }
  };

  if (loading) return <p className="info-msg">লোড হচ্ছে...</p>;
  if (!otherUser) return <p className="info-msg">ইউজার খুঁজে পাওয়া যায়নি</p>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <Link to="/inbox">⬅</Link>
        <img src={getImageUrl(otherUser.avatar)} alt={otherUser.name} />
        <div>
          <strong>{otherUser.name}</strong>
          <p className="chat-status">
            {onlineUsers.includes(userId)
              ? otherUserTyping
                ? "টাইপ করছে..."
                : "অনলাইন"
              : "অফলাইন"}
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isMine = (msg.senderId || msg.sender?._id) === me._id;
          return (
            <div
              key={msg._id}
              className={isMine ? "chat-bubble mine" : "chat-bubble theirs"}
            >
              {msg.text}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="একটা মেসেজ লিখুন..."
          value={text}
          onChange={handleTypingInput}
        />
        <button type="submit" disabled={!text.trim()}>
          পাঠান
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;