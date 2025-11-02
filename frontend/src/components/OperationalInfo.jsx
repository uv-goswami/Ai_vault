import { useEffect, useState } from "react";
import api from "../api/axios";

export default function OperationalInfo({ businessId }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    api
      .get(`/operational-info/?business_id=${businessId}`)
      .then((res) => {
        const data = res.data;
        setInfo(Array.isArray(data) ? data[0] : data);
      })
      .catch((err) => console.error("Failed to fetch operational info:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <p className="text-blue-500">Loading operational info...</p>;
  if (!info) return <p className="text-gray-500">No operational info available.</p>;

  return (
    <ul className="space-y-2 text-sm text-gray-700">
      <li><strong>Opening Hours:</strong> {info.opening_hours}</li>
      <li><strong>Closing Hours:</strong> {info.closing_hours}</li>
      <li><strong>Off Days:</strong> {info.off_days || "None"}</li>
      <li><strong>Delivery Options:</strong> {info.delivery_options || "N/A"}</li>
      <li><strong>Reservation Options:</strong> {info.reservation_options || "N/A"}</li>
      <li><strong>Wi-Fi Available:</strong> {info.wifi_available ? "Yes" : "No"}</li>
      <li><strong>Accessibility Features:</strong> {info.accessibility_features || "None listed"}</li>
      <li><strong>Nearby Parking Spot:</strong> {info.nearby_parking_spot || "Not specified"}</li>
    </ul>
  );
}
