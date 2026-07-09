import { useState, useEffect, useRef } from "react";
import { fetchFeed, createPost } from "../api/postApi";
import { fetchMyProfile } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";
import PostCard from "../components/PostCard";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myAvatar, setMyAvatar] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [posting, setPosting] = useState(false);

  const fileInputRef = useRef(null);

  const loadFeed = async () => {
    try {
      const data = await fetchFeed();
      setPosts(data);
    } catch (err) {
      // feed stays empty on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    fetchMyProfile()
      .then((data) => setMyAvatar(data.avatar))
      .catch(() => {});
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setPosting(true);
    try {
      const newPost = await createPost(text.trim(), imageFile);
      setPosts([newPost, ...posts]);
      setText("");
      removeImage();
    } catch (err) {
      alert(err.response?.data?.message || "পোস্ট করা যায়নি");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  const handleUpdated = (updatedPost) => {
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <div className="feed-page">
      <form className="create-post-box" onSubmit={handlePost}>
        <div className="create-post-top">
          <img src={getImageUrl(myAvatar)} alt="me" className="post-avatar" />
          <textarea
            placeholder="আপনার মনে কী চলছে?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {imagePreview && (
          <div className="image-preview-wrapper">
            <img src={imagePreview} alt="preview" />
            <button type="button" onClick={removeImage}>✕</button>
          </div>
        )}

        <div className="create-post-actions">
          <button
            type="button"
            className="attach-image-btn"
            onClick={() => fileInputRef.current.click()}
          >
            🖼️ ছবি যোগ করুন
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
          <button type="submit" disabled={posting || (!text.trim() && !imageFile)}>
            {posting ? "পোস্ট হচ্ছে..." : "পোস্ট করুন"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="info-msg">লোড হচ্ছে...</p>
      ) : posts.length === 0 ? (
        <p className="info-msg">এখনো কোনো পোস্ট নেই। প্রথম পোস্টটা আপনিই করুন!</p>
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
    </div>
  );
};

export default Feed;