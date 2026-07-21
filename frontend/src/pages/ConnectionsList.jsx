import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserProfile } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";

const titleMap = {
  followers: "Followers",
  following: "Following",
};

const ConnectionsList = () => {
  const { id, type } = useParams(); // type = "followers" | "following"
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile(id);
        setPeople(data[type] || []);
      } catch (err) {
        setMessage("The list could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, type]);

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  return (
    <div className="profile-page">
      <h2 style={{ padding: "20px 20px 0" }}>
        {titleMap[type] || "List"} ({people.length})
      </h2>

      {message && <p className="info-msg">{message}</p>}

      {people.length === 0 ? (
        <p style={{ padding: "20px" }}>There is no one here yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
          {people.map((person) => (
            <Link
              key={person._id}
              to={`/users/${person._id}`}
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
                src={getImageUrl(person.avatar)}
                alt={person.name}
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontWeight: "bold" }}>{person.name}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="profile-nav-links" style={{ padding: "0 20px 20px" }}>
        <Link to="/dashboard">⬅ Return Dashboard</Link>
      </div>
    </div>
  );
};

export default ConnectionsList;