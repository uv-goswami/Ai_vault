import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import api from "../api/axios";
import ServiceList from "../components/ServiceList";
import MediaGallery from "../components/MediaGallery";
import CouponList from "../components/CouponList";
import OperationalInfo from "../components/OperationalInfo";
import AiMetadataCard from "../components/AiMetadataCard";
import VisibilityReport from "../components/VisibilityReport";
import "../styles/business-profile.css"; // custom styles

export default function BusinessProfile() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [info, setInfo] = useState(null);
  const [media, setMedia] = useState([]);
  const [services, setServices] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    api.get(`/business/${id}`).then((res) => setBusiness(res.data));
    api.get(`/operational-info/?business_id=${id}`).then((res) => {
      const data = res.data;
      setInfo(Array.isArray(data) ? data[0] : data);
    });
    api.get(`/media/?business_id=${id}`).then((res) => setMedia(res.data));
    api
      .get(`/services/?business_id=${id}&limit=100&offset=0`)
      .then((res) => setServices(res.data));
    api
      .get(`/coupons/?business_id=${id}&limit=100&offset=0`)
      .then((res) => setCoupons(res.data));
  }, [id]);

  if (!business)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading business profile...</p>
      </div>
    );

  const schemaType =
    business.business_type === "restaurant"
      ? "Restaurant"
      : business.business_type === "salon"
      ? "HairSalon"
      : business.business_type === "clinic"
      ? "MedicalClinic"
      : "LocalBusiness";

  const jsonld = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: business.name,
    description: business.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: "New Delhi",
      addressRegion: "DL",
      postalCode: "110019",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.latitude,
      longitude: business.longitude, // fixed typo
    },
    openingHours: info?.opening_hours
      ? `Mo-Sa ${info.opening_hours}-${info.closing_hours}`
      : undefined,
    image: media.find((m) => m.media_type === "image")?.url,
    url: `https://aivault.com/business/${id}`,
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: s.description,
      },
      price: s.price,
      priceCurrency: s.currency,
    })),
    hasCoupon: coupons.map((c) => ({
      "@type": "Offer",
      discountCode: c.code,
      description: c.description,
      validFrom: c.valid_from?.slice(0, 10),
      validThrough: c.valid_until?.slice(0, 10),
      priceCurrency: c.discount_value,
    })),
  };

  return (
    <div className="profile-container min-h-screen bg-gray-100 px-4 md:px-8 lg:px-16 py-6 space-y-8">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonld)}</script>
      </Helmet>

      {/* Header */}
      <header className="profile-header">
        <h1>{business.name}</h1>
        {business.description && <p>{business.description}</p>}
      </header>

      {/* Services */}
      <section className="profile-section">
        <h2>Services</h2>
        <ServiceList businessId={id} />
      </section>

      {/* Media */}
      <section className="profile-section">
        <h2>Media Gallery</h2>
        <MediaGallery businessId={id} />
      </section>

      {/* Coupons */}
      <section className="profile-section">
        <h2>Available Coupons</h2>
        <CouponList businessId={id} />
      </section>

      {/* Operational Info */}
      <section className="profile-section">
        <h2>Operational Info</h2>
        <OperationalInfo businessId={id} />
      </section>

      {/* AI Metadata */}
      <section className="profile-section">
        <h2>AI Metadata</h2>
        <AiMetadataCard businessId={id} />
      </section>

      {/* Visibility Report */}
      <section className="profile-section">
        <h2>Visibility Report</h2>
        <VisibilityReport businessId={id} />
      </section>
    </div>
  );
}
