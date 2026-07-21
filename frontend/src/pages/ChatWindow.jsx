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

  // Listen for real-time incoming messages / typing indicators / seen receipts
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

    const handleMessagesSeen = ({ seenBy }) => {
      if (seenBy !== userId) return;
      setMessages((prev) =>
        prev.map((m) => {
          const isMine = (m.senderId || m.sender?._id) === me._id;
          return isMine ? { ...m, seen: true } : m;
        })
      );
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, userId, me._id]);

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
      alert(err.response?.data?.message || "Message could not be sent.");
    }
  };

  if (loading) return <p className="info-msg">Loading...</p>;
  if (!otherUser) return <p className="info-msg">User not found!</p>;

  // Find the index of the last message that I sent, so we only show
  // the seen/delivered indicator on the most recent one (like Messenger does)
  const lastMineIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const isMine = (messages[i].senderId || messages[i].sender?._id) === me._id;
      if (isMine) return i;
    }
    return -1;
  })();

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
                ? "Typing..."
                : "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isMine = (msg.senderId || msg.sender?._id) === me._id;
          return (
            <div key={msg._id} className={isMine ? "chat-bubble mine" : "chat-bubble theirs"}>
              {msg.text}
              {isMine && idx === lastMineIndex && (
                <span className={msg.seen ? "seen-indicator seen" : "seen-indicator"}>
                  {msg.seen ? "✓✓ Seen" : "✓ Sent"}
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Write a message..."
          value={text}
          onChange={handleTypingInput}
        />
        <button type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;