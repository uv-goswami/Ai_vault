import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user_id"); // clear session
    navigate("/"); // redirect to home/landing
  };

  return (
    <button onClick={handleLogout} className="btn btn-secondary">
      Log Out
    </button>
  );
}
