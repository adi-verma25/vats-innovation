import { Outlet, NavLink } from "react-router-dom";

export default function EmployeeLayout() {
  const menuStyle = ({ isActive }) => ({
    color: "white",
    textDecoration: "none",
    display: "block",
    padding: "12px 15px",
    marginBottom: "10px",
    borderRadius: "8px",
    background: isActive ? "#2563eb" : "transparent",
    transition: "0.3s",
    fontWeight: "500",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          background: "#0f172a",
          color: "#fff",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Employee Portal
        </h2>

        <hr style={{ marginBottom: "20px" }} />

        <NavLink
          to="/employee"
          end
          style={menuStyle}
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/employee/work-orders"
          style={menuStyle}
        >
          📋 My Work Orders
        </NavLink>

        <NavLink
          to="/employee/attendance"
          style={menuStyle}
        >
          🕒 Attendance
        </NavLink>

        <NavLink
          to="/employee/profile"
          style={menuStyle}
        >
          👤 Profile
        </NavLink>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}