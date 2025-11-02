import { useEffect, useState } from "react";
import api from "../api/axios";

export default function VisibilityReport({ businessId }) {
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    Promise.all([
      api.get(`/visibility-result/?business_id=${businessId}`),
      api.get(`/visibility-suggestions/?business_id=${businessId}`)
    ])
      .then(([resultRes, suggestionsRes]) => {
        const resultData = resultRes.data;
        const suggestionsData = suggestionsRes.data;
        setResult(Array.isArray(resultData) ? resultData[0] : resultData);
        setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
      })
      .catch((err) => console.error("Failed to fetch visibility data:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <p className="text-blue-500">Loading visibility report...</p>;
  if (!result) return <p className="text-gray-500">No visibility data available.</p>;

  return (
    <>
      <ul className="space-y-2 text-sm text-gray-700">
        <li><strong>Score:</strong> <span className="text-green-700 font-semibold">{result.visibility_score}</span></li>
        <li><strong>Issues Found:</strong> {result.issues_found || "None"}</li>
        <li><strong>Recommendations:</strong> {result.recommendations || "N/A"}</li>
        <li><strong>Snapshot:</strong> {result.output_snapshot || "Not available"}</li>
        <li><strong>Completed At:</strong> {result.completed_at?.slice(0, 10)}</li>
      </ul>

      <h3 className="text-lg font-semibold mt-6 mb-2">Suggestions</h3>
      {suggestions.length === 0 ? (
        <p className="text-gray-500">No suggestions available.</p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s.suggestion_id} className="border p-3 rounded bg-gray-50 hover:shadow transition">
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-gray-600">Type: {s.suggestion_type}</p>
              <p className="text-sm text-gray-500">Status: <span className={`font-semibold ${s.status === "pending" ? "text-yellow-600" : "text-green-600"}`}>{s.status}</span></p>
              <p className="text-sm text-gray-500">Suggested At: {s.suggested_at?.slice(0, 10)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
