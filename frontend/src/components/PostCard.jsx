import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  deletePost,
  updatePost,
  toggleLike,
  addComment,
  fetchComments,
  deleteComment,
  toggleSave,
  sharePost,
} from "../api/postApi";
import { getImageUrl } from "../utils/getImageUrl";
import { useAuth } from "../context/AuthContext";

const PostCard = ({ post, onDeleted, onUpdated }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.text);
  const [saving, setSaving] = useState(false);

  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(post.savedByMe || false);
  const [liked, setLiked] = useState(
    post.likes?.some((id) => id === user?._id) || false
  );

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // which comment we're replying to
  const [replyText, setReplyText] = useState("");
  const [commenting, setCommenting] = useState(false);

  const isOwner = user?._id === post.user._id;

  const handleDelete = async () => {
    if (!window.confirm("এই পোস্টটা ডিলিট করতে চান?")) return;
    try {
      await deletePost(post._id);
      onDeleted(post._id);
    } catch (err) {
      alert(err.response?.data?.message || "ডিলিট করা যায়নি");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePost(post._id, text);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "আপডেট করা যায়নি");
    } finally {
      setSaving(false);
    }
  };


  const handleLikeClick = async () => {
    try {
      const result = await toggleLike(post._id);
      setLikesCount(result.likesCount);
      setLiked(result.liked);
    } catch (err) {
      // silently ignore, likes aren't critical
    }
  };

 const handleSaveClick = async () => {
  try {
    const result = await toggleSave(post._id);
    setSaved(result.saved);
  } catch (err) {
    // silently ignore
  }
};

const handleShareClick = async () => {
  try {
    await sharePost(post._id);
    alert("পোস্টটা শেয়ার হয়েছে! আপনার প্রোফাইলে দেখুন।");
  } catch (err) {
    alert(err.response?.data?.message || "শেয়ার করা যায়নি");
  }
};

  const loadComments = async () => {
    try {
      const data = await fetchComments(post._id);
      setComments(data);
      setCommentsLoaded(true);
    } catch (err) {
      // ignore
    }
  };

  const toggleCommentsSection = () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening && !commentsLoaded) {
      loadComments();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      const comment = await addComment(post._id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment("");
    } catch (err) {
      alert(err.response?.data?.message || "কমেন্ট করা যায়নি");
    } finally {
      setCommenting(false);
    }
  };

  const handleAddReply = async (e, parentId) => {
  e.preventDefault();
  if (!replyText.trim()) return;
  try {
    const reply = await addComment(post._id, replyText.trim(), parentId);
    setComments(
      comments.map((c) =>
        c._id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
    setReplyText("");
    setReplyingTo(null);
  } catch (err) {
    alert(err.response?.data?.message || "রিপ্লাই করা যায়নি");
  }
};


  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || "কমেন্ট ডিলিট করা যায়নি");
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/users/${post.user._id}`}>
          <img
            src={getImageUrl(post.user.avatar)}
            alt={post.user.name}
            className="post-avatar"
          />
        </Link>
        <div>
          <Link to={`/users/${post.user._id}`} className="post-author-name">
            {post.user.name}
          </Link>
          <p className="post-time">
            {new Date(post.createdAt).toLocaleString("bn-BD")}
          </p>
        </div>

        {isOwner && (
          <div className="post-owner-actions">
            <button onClick={() => setEditing(!editing)}>✏️</button>
            <button onClick={handleDelete}>🗑️</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="post-edit-box">
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
          <div className="edit-actions">
            <button onClick={handleSave} disabled={saving}>
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
            <button className="cancel-btn" onClick={() => setEditing(false)}>
              বাতিল
            </button>
          </div>
        </div>
      ) : (
        post.text && <p className="post-text">{post.text}</p>
      )}

      {post.image && (
        <img src={getImageUrl(post.image)} alt="post" className="post-image" />
      )}
      {post.video && (
        <video
         src={getImageUrl(post.video)}
         controls
         className="post-image"
       />
      )}
      {post.sharedPost && (
  <div className="shared-post-box">
    <div className="post-header">
      <Link to={`/users/${post.sharedPost.user._id}`}>
        <img
          src={getImageUrl(post.sharedPost.user.avatar)}
          alt={post.sharedPost.user.name}
          className="post-avatar"
        />
      </Link>
      <div>
        <Link
          to={`/users/${post.sharedPost.user._id}`}
          className="post-author-name"
        >
          {post.sharedPost.user.name}
        </Link>
        <p className="post-time">
          {new Date(post.sharedPost.createdAt).toLocaleString("bn-BD")}
        </p>
      </div>
    </div>
    {post.sharedPost.text && (
      <p className="post-text">{post.sharedPost.text}</p>
    )}
    {post.sharedPost.image && (
      <img
        src={getImageUrl(post.sharedPost.image)}
        alt="shared post"
        className="post-image"
      />
    )}
  </div>
)}

      <div className="post-stats">
        {likesCount > 0 && <span>❤️ {likesCount}</span>}
        {comments.length > 0 && <span>{comments.length} টি কমেন্ট</span>}
      </div>

      <div className="post-action-bar">
        <button
          className={liked ? "like-btn liked" : "like-btn"}
          onClick={handleLikeClick}
        >
          {liked ? "❤️ লাইক দেওয়া হয়েছে" : "🤍 লাইক"}
        </button>
        <button className="comment-toggle-btn" onClick={toggleCommentsSection}>
          💬 কমেন্ট
        </button>
        <button
         className={saved ? "save-btn saved" : "save-btn"}
         onClick={handleSaveClick}
         >
        {saved ? "🔖 সেভ করা আছে" : "📑 সেভ করুন"}
       </button>
       <button className="share-btn" onClick={handleShareClick}>
         🔄 শেয়ার
       </button>

      </div>

      {showComments && (
        <div className="comments-section">
           {comments.map((c) => (
                <div key={c._id}>
                  <div className="comment-item">
                  <img src={getImageUrl(c.user.avatar)} alt={c.user.name} />
                  <div className="comment-bubble">
                  <strong>{c.user.name}</strong>
                  <p>{c.text}</p>
            <button
             className="reply-toggle-btn"
             onClick={() =>
             setReplyingTo(replyingTo === c._id ? null : c._id)
             }
        >
          রিপ্লাই
        </button>
      </div>
      {c.user._id === user?._id && (
        <button
          className="delete-comment-btn"
          onClick={() => handleDeleteComment(c._id)}
        >
          ✕
        </button>
      )}
    </div>

    {/* Nested replies */}
    {c.replies?.map((r) => (
      <div className="comment-item reply-item" key={r._id}>
        <img src={getImageUrl(r.user.avatar)} alt={r.user.name} />
        <div className="comment-bubble">
          <strong>{r.user.name}</strong>
          <p>{r.text}</p>
        </div>
        {r.user._id === user?._id && (
          <button
            className="delete-comment-btn"
            onClick={() => handleDeleteComment(r._id)}
          >
            ✕
          </button>
        )}
      </div>
    ))}

    {/* Reply input box, only shown for the comment being replied to */}
    {replyingTo === c._id && (
      <form
        className="add-comment-form reply-form"
        onSubmit={(e) => handleAddReply(e, c._id)}
      >
        <input
          type="text"
          placeholder="একটা রিপ্লাই লিখুন..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button type="submit" disabled={!replyText.trim()}>
          পাঠান
        </button>
      </form>
    )}
  </div>
   ))}

          <form className="add-comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="একটা কমেন্ট লিখুন..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" disabled={commenting || !newComment.trim()}>
              পাঠান
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;