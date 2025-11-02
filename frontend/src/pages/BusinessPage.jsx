import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/business.css"; // optional if you want scoped styles

export default function BusinessPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("restaurant");
  const [businessAddress, setBusinessAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      api.get(`/business/by-owner/${userId}`)
        .then((res) => {
          const businessId = res.data.business_id;
          navigate(`/dashboard/${businessId}`);
        })
        .catch(() => {
          // no business yet, stay on page
        });
    }
  }, []);

  const handleRegister = () => {
    if (!email || !password || !businessName || !businessAddress) {
      setError("Please fill all required fields.");
      return;
    }

    api
      .post("/users", {
        email,
        name,
        auth_provider: "password",
        password_hash: password,
      })
      .then((res) => {
        const userId = res.data.user_id;
        localStorage.setItem("user_id", userId);

        return api.post("/business", {
          owner_id: userId,
          name: businessName,
          business_type: businessType,
          address: businessAddress,
          published: true,
        });
      })
      .then((res) => {
        const businessId = res.data.business_id;
        navigate(`/dashboard/${businessId}`);
      })
      .catch(() => setError("Registration failed. Try again."));
  };

  const handleLogin = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    api
      .post("/auth/login", { email, password })
      .then((res) => {
        const userId = res.data.user_id;
        localStorage.setItem("user_id", userId);

        return api.get(`/business/by-owner/${userId}`);
      })
      .then((res) => {
        const businessId = res.data.business_id;
        navigate(`/dashboard/${businessId}`);
      })
      .catch(() => setError("Login failed. Check credentials."));
  };

  return (
    <div className="business-page">
      <h1>Business Access</h1>
      <div className="mode-toggle">
        <button onClick={() => setMode("login")} className={mode === "login" ? "active" : ""}>
          Sign In
        </button>
        <button onClick={() => setMode("register")} className={mode === "register" ? "active" : ""}>
          Register
        </button>
      </div>

      <div className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="restaurant">Restaurant</option>
              <option value="salon">Salon</option>
              <option value="clinic">Clinic</option>
            </select>
            <input
              type="text"
              placeholder="Business Address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
            />
          </>
        )}
        {error && <p className="error">{error}</p>}
        <button onClick={mode === "login" ? handleLogin : handleRegister}>
          {mode === "login" ? "Sign In" : "Register & Create Business"}
        </button>
      </div>
    </div>
  );
}
