import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে");
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>রেজিস্টার করুন</h2>

        {error && <p className="error-msg">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="আপনার নাম"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="ইমেইল"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="পাসওয়ার্ড (কমপক্ষে ৬ ক্যারেক্টার)"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "প্রসেসিং..." : "রেজিস্টার"}
        </button>

        <p className="switch-link">
          অ্যাকাউন্ট আছে? <Link to="/login">লগইন করুন</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
