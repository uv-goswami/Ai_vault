import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ServiceList({ businessId }) {
  const [services, setServices] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const limit = 5;

  useEffect(() => {
    if (!businessId) return;
    setServices([]);
    setOffset(0);
    setHasMore(true);
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    api
      .get(`/services/?business_id=${businessId}&limit=${limit}&offset=${offset}`)
      .then((res) => {
        const newData = res.data;
        setServices((prev) => [...prev, ...newData]);
        if (newData.length < limit) setHasMore(false);
      })
      .catch((err) => {
        console.error("Failed to fetch services:", err);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [businessId, offset]);

  return (
    <div>
      {services.length === 0 && !loading && (
        <p className="text-gray-500">No services found for this business.</p>
      )}
      <ul className="space-y-3">
        {services.map((service) => (
          <li key={service.service_id} className="border p-3 rounded hover:shadow transition">
            <div className="font-semibold text-lg text-gray-800">{service.name}</div>
            {service.description && (
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            )}
          </li>
        ))}
      </ul>
      {loading && <p className="mt-4 text-blue-500">Loading...</p>}
      {hasMore && !loading && (
        <button
          onClick={() => setOffset(offset + limit)}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Load More
        </button>
      )}
    </div>
  );
}
