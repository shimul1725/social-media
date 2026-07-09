import { useState } from "react";
import { Link } from "react-router-dom";
import { searchUsers } from "../api/userApi";
import { getImageUrl } from "../utils/getImageUrl";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchUsers(query.trim());
      setResults(data);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h2>মানুষ খুঁজুন</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="নাম দিয়ে খুঁজুন..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "খোঁজা হচ্ছে..." : "খুঁজুন"}
        </button>
      </form>

      <div className="search-results">
        {searched && !loading && results.length === 0 && (
          <p className="info-msg">কোনো ইউজার পাওয়া যায়নি।</p>
        )}

        {results.map((u) => (
          <Link to={`/users/${u._id}`} key={u._id} className="search-result-card">
            <img src={getImageUrl(u.avatar)} alt={u.name} />
            <div>
              <strong>{u.name}</strong>
              <p>{u.bio || "কোনো বায়ো নেই"}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link className="back-link" to="/dashboard">⬅ ড্যাশবোর্ডে ফিরুন</Link>
    </div>
  );
};

export default Search;