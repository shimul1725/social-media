import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchSavedPosts } from "../api/postApi";
import PostCard from "../components/PostCard";

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSavedPosts = async () => {
    try {
      const data = await fetchSavedPosts();
      setPosts(data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const handleUpdated = (updatedPost) => {
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handleDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  return (
    <div className="feed-page">
      <h2>সেভ করা পোস্ট</h2>

      {loading ? (
        <p className="info-msg">লোড হচ্ছে...</p>
      ) : posts.length === 0 ? (
        <p className="info-msg">
          এখনো কোনো পোস্ট সেভ করা হয়নি। কোনো পোস্টের "সেভ করুন" বাটনে ক্লিক করুন।
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDeleted={handleDeleted}
            onUpdated={handleUpdated}
          />
        ))
      )}

      <Link to="/feed" className="back-link">⬅ ফিডে ফিরুন</Link>
    </div>
  );
};

export default SavedPosts;