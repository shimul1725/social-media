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
      <h2>Saved Posts</h2>

      {loading ? (
        <p className="info-msg">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="info-msg">
          No posts have been saved yet. Click the "Save" button on any post.
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

      <Link to="/feed" className="back-link">⬅ Return To Feed</Link>
    </div>
  );
};

export default SavedPosts;