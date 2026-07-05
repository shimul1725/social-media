import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>স্বাগতম, {user?.name} 👋</h2>
        <p>ইমেইল: {user?.email}</p>
        <p className="hint">
          এটি Phase 1 এর basic dashboard। এখান থেকে পরবর্তী ধাপে Profile, News
          Feed, Chat ইত্যাদি ফিচার যোগ করা হবে।
        </p>
        <button onClick={handleLogout}>লগআউট</button>
      </div>
    </div>
  );
};

export default Dashboard;
