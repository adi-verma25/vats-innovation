import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div
      style={{
        height: "70px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 25px",
        boxShadow: "0 3px 8px rgba(0,0,0,.1)",
      }}
    >
      <h2>Admin Dashboard</h2>

      <button
        onClick={handleLogout}
        style={{
          background: "#2563EB",
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}