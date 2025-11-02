import { useEffect, useState } from "react";
import api from "../api/axios";

export default function MediaGallery({ businessId }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    api
      .get(`/media/?business_id=${businessId}`)
      .then((res) => setMedia(res.data))
      .catch((err) => console.error("Failed to fetch media:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <p className="text-blue-500">Loading media...</p>;
  if (media.length === 0) return <p className="text-gray-500">No media assets found.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {media.map((item) => (
        <div key={item.asset_id} className="border rounded p-2 hover:shadow transition">
          {item.media_type === "image" && (
            <img src={item.url} alt={item.alt_text || "Business media"} className="w-full h-auto rounded" />
          )}
          {item.media_type === "video" && (
            <video controls className="w-full rounded">
              <source src={item.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          {item.media_type === "document" && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View Document
            </a>
          )}
          <p className="text-sm text-gray-600 mt-2">{item.alt_text}</p>
        </div>
      ))}
    </div>
  );
}
