import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";
import api from "../api/axios";
import ServiceList from "../components/ServiceList";
import MediaGallery from "../components/MediaGallery";
import CouponList from "../components/CouponList";
import OperationalInfo from "../components/OperationalInfo";
import AiMetadataCard from "../components/AiMetadataCard";
import VisibilityReport from "../components/VisibilityReport";

export default function BusinessDashboard() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    api
      .get(`/business/${id}`)
      .then((res) => setBusiness(res.data))
      .catch((err) => console.error("Failed to fetch business:", err));
  }, [id]);

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading business dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container min-h-screen bg-gray-100 px-4 md:px-8 lg:px-16 py-8 space-y-10">
      {/* Header */}
      <header className="bg-white rounded-lg shadow p-6 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
        {business.description && (
          <p className="text-gray-600 text-base">{business.description}</p>
        )}
        <p className="text-sm text-gray-500 italic">Business ID: {id}</p>
      </header>

      {/* Services */}
      <section className="section-card">
        <h2 className="section-title">Services</h2>
        <ServiceList businessId={id} />
      </section>

      {/* Media */}
      <section className="section-card">
        <h2 className="section-title">Media Gallery</h2>
        <MediaGallery businessId={id} />
      </section>

      {/* Coupons */}
      <section className="section-card">
        <h2 className="section-title">Available Coupons</h2>
        <CouponList businessId={id} />
      </section>

      {/* Operational Info */}
      <section className="section-card">
        <h2 className="section-title">Operational Info</h2>
        <OperationalInfo businessId={id} />
      </section>

      {/* AI Metadata */}
      <section className="section-card">
        <h2 className="section-title">AI Metadata</h2>
        <AiMetadataCard businessId={id} />
      </section>

      {/* Visibility Report */}
      <section className="section-card">
        <h2 className="section-title">Visibility Report</h2>
        <VisibilityReport businessId={id} />
      </section>
    </div>
  );
}
