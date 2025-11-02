import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AiMetadataCard({ businessId }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    api
      .get(`/ai-metadata/?business_id=${businessId}`)
      .then((res) => setMetadata(res.data[0]))
      .catch((err) => console.error("Failed to fetch AI metadata:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <p className="text-blue-500">Loading AI metadata...</p>;
  if (!metadata) return <p className="text-gray-500">No AI metadata available.</p>;

  return (
    <ul className="space-y-2 text-sm text-gray-700">
      <li><strong>Extracted Insights:</strong> {metadata.extracted_insights}</li>
      <li><strong>Detected Entities:</strong> {metadata.detected_entities}</li>
      <li><strong>Keywords:</strong> {metadata.keywords}</li>
      <li><strong>Intent Labels:</strong> {metadata.intent_labels}</li>
      <li><strong>Generated At:</strong> {metadata.generated_at?.slice(0, 10) || "N/A"}</li>
    </ul>
  );
}
