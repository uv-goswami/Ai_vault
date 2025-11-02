import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CouponList({ businessId }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    api
      .get(`/coupons/?business_id=${businessId}`)
      .then((res) => setCoupons(res.data))
      .catch((err) => console.error("Failed to fetch coupons:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) return <p className="text-blue-500">Loading coupons...</p>;
  if (coupons.length === 0) return <p className="text-gray-500">No active coupons available.</p>;

  return (
    <ul className="space-y-4">
      {coupons.map((coupon) => (
        <li key={coupon.coupon_id} className="border p-3 rounded bg-gray-50 hover:shadow transition">
          <div className="font-semibold text-lg text-green-700">{coupon.code}</div>
          <p className="text-sm text-gray-600">{coupon.description}</p>
          <p className="text-sm text-gray-500">Valid from: {coupon.valid_from?.slice(0, 10)}</p>
          <p className="text-sm text-gray-500">Valid until: {coupon.valid_until?.slice(0, 10)}</p>
          <p className="text-sm text-gray-500 italic">
            {coupon.terms_conditions || "No terms specified"}
          </p>
        </li>
      ))}
    </ul>
  );
}
