import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import API from "../api/axios";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/friends/requests");
      setRequests(data);
    } catch (err) {
      setMessage("The request could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleConfirm = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await API.put(`/friends/accept/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setMessage(err.response?.data?.message || "It could not be accepted.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await API.delete(`/friends/reject/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not be deleted.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  return (
    <div className="profile-page" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Friend Requests</h2>

      {message && <p className="info-msg">{message}</p>}

      {requests.length === 0 ? (
        <p>There are no friend requests at the moment.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {requests.map((req) => (
            <div
              key={req._id}
              style={{
                background: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <Link to={`/users/${req.sender._id}`}>
                <img
                  src={getImageUrl(req.sender.avatar)}
                  alt={req.sender.name}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
              </Link>
              <div style={{ padding: "10px" }}>
                <Link
                  to={`/users/${req.sender._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <p style={{ fontWeight: "bold", margin: "0 0 10px" }}>{req.sender.name}</p>
                </Link>

                <button
                  onClick={() => handleConfirm(req._id)}
                  disabled={actionLoadingId === req._id}
                  style={{
                    width: "100%",
                    background: "#1877f2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px",
                    fontWeight: "600",
                    marginBottom: "6px",
                    cursor: "pointer",
                  }}
                >
                  {actionLoadingId === req._id ? "..." : "Confirm"}
                </button>

                <button
                  onClick={() => handleDelete(req._id)}
                  disabled={actionLoadingId === req._id}
                  style={{
                    width: "100%",
                    background: "#e4e6eb",
                    color: "#050505",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="profile-nav-links" style={{ marginTop: "20px" }}>
        <Link to="/dashboard">⬅ Return to dashboard</Link>
      </div>
    </div>
  );
};

export default FriendRequests;