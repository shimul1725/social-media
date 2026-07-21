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
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [posting, setPosting] = useState(false);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
  removeVideo();
  };
  const handleVideoSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setVideoFile(file);
  setVideoPreview(URL.createObjectURL(file));
  // A post can only have one media type at a time
  removeImage();
};

const removeVideo = () => {
  setVideoFile(null);
  setVideoPreview("");
};

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile && !videoFile) return;

    setPosting(true);
    try {
      const newPost = await createPost(text.trim(), imageFile, videoFile);
      setPosts([newPost, ...posts]);
      setText("");
      removeImage();
      removeVideo();
    } catch (err) {
      alert(err.response?.data?.message || "Could not be posted.");
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
            placeholder="What is on your mind?"
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
        {videoPreview && (
            <div className="image-preview-wrapper">
            <video src={videoPreview} controls className="video-preview" />
            <button type="button" onClick={removeVideo}>✕</button>
            </div>
         )}

        <div className="create-post-actions">
          <button
            type="button"
            className="attach-image-btn"
            onClick={() => fileInputRef.current.click()}
          >
            🖼️ Image
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
           
           <button
             type="button"
             className="attach-image-btn"
             onClick={() => videoInputRef.current.click()}
            >
             🎬 Video
           </button>
         <input
             type="file"
             accept="video/*"
             ref={videoInputRef}
             style={{ display: "none" }}
             onChange={handleVideoSelect}
          />
          <button type="submit" disabled={posting || (!text.trim() && !imageFile && !videoFile)}>
            {posting ? "Posting..." : "Post Now"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="info-msg">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="info-msg">No posts yet. Create the first one!</p>
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