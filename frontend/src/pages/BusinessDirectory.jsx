import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/directory.css"; // import the new stylesheet

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/business?limit=100&offset=0")
      .then((res) => setBusinesses(res.data))
      .catch((err) => console.error("Failed to fetch businesses:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="directory-container">
      <div className="directory-header">
        <h1>Explore Businesses</h1>
        <p>Click any business to view its public profile.</p>
      </div>

      {loading && <p className="text-blue-500">Loading businesses...</p>}
      {!loading && businesses.length === 0 && (
        <p className="text-gray-500">No businesses found.</p>
      )}

      <ul className="business-grid">
        {businesses.map((b) => (
          <li key={b.business_id} className="business-card">
            <h2>{b.name}</h2>
            <p>{b.description}</p>
            <Link to={`/business/${b.business_id}`}>View Public Profile</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
