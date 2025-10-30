import ServiceList from "../components/ServiceList";

export default function Home() {
  const businessId = 1; // Replace with actual business_id if dynamic

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">AiVault Dashboard</h1>
      <ServiceList businessId={businessId} />
    </div>
  );
}
