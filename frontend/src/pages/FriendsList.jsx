import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchFriendsListByUserId } from "../api/friendApi";
import { getImageUrl } from "../utils/getImageUrl";

const FriendsList = () => {
  const { id } = useParams();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadFriends = async () => {
      setLoading(true);
      try {
        const data = await fetchFriendsListByUserId(id);
        setFriends(data);
      } catch (err) {
        setMessage("ফ্রেন্ড লিস্ট লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>লোড হচ্ছে...</p>;

  return (
    <div className="profile-page">
      <h2 style={{ padding: "20px 20px 0" }}>Friends ({friends.length})</h2>

      {message && <p className="info-msg">{message}</p>}

      {friends.length === 0 ? (
        <p style={{ padding: "20px" }}>এখনো কোনো ফ্রেন্ড নাই।</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
          {friends.map((friend) => (
            <Link
              key={friend._id}
              to={`/users/${friend._id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px",
                borderRadius: "8px",
                background: "#fff",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img
                src={getImageUrl(friend.avatar)}
                alt={friend.name}
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontWeight: "bold" }}>{friend.name}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="profile-nav-links" style={{ padding: "0 20px 20px" }}>
        <Link to="/dashboard">⬅ ড্যাশবোর্ডে ফিরুন</Link>
      </div>
    </div>
  );
};

export default FriendsList;