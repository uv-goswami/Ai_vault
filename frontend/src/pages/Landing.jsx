import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <h1 className="title">Welcome to AiVault</h1>
      <p className="subtitle">
        Discover AI-powered business profiles or manage your own dashboard.
      </p>

      <div className="actions">
        <button
          onClick={() => navigate("/business-access")}
          className="primary"
        >
          Business Access
        </button>
        <button
          onClick={() => navigate("/directory")}
          className="secondary"
        >
          Explore Businesses
        </button>
      </div>
    </div>
  );
}
