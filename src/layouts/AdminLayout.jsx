import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const menuStyle = ({ isActive }) => ({
    display: "block",
    padding: "12px 18px",
    marginBottom: "10px",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "10px",
    background: isActive ? "#2563eb" : "transparent",
    fontWeight: isActive ? "600" : "400",
    transition: "all 0.3s",
  });

  const subMenuStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 18px 10px 38px",
    marginBottom: "7px",
    color: isActive ? "#ffffff" : "#cbd5e1",
    textDecoration: "none",
    borderRadius: "8px",
    background: isActive ? "#1d4ed8" : "transparent",
    fontWeight: isActive ? "600" : "400",
    fontSize: "14px",
    transition: "all 0.3s",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "25px",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div>
          <h2
            style={{
              textAlign: "center",
              marginTop: 0,
              marginBottom: "25px",
            }}
          >
            🏢 VATS ERP
          </h2>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #334155",
              marginBottom: "20px",
            }}
          />

          <NavLink to="/admin" end style={menuStyle}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/employees" style={menuStyle}>
            👥 Employees
          </NavLink>

          <NavLink to="/admin/employees/add" style={menuStyle}>
            ➕ Add Employee
          </NavLink>

          <NavLink to="/admin/attendance" style={menuStyle}>
            🕒 Attendance
          </NavLink>

          <NavLink to="/admin/payroll" style={menuStyle}>
            💰 Payroll
          </NavLink>

          <NavLink to="/admin/leave" style={menuStyle}>
            📅 Leave Management
          </NavLink>

          {/* Projects section */}
          <NavLink to="/admin/projects" end style={menuStyle}>
            📁 Projects
          </NavLink>

          <div
            style={{
              marginTop: "-3px",
              marginBottom: "10px",
              paddingLeft: "4px",
              borderLeft: "2px solid #334155",
            }}
          >
            <NavLink
              to="/admin/projects/states"
              style={subMenuStyle}
            >
              🗺 States
            </NavLink>

            <NavLink
              to="/admin/projects/districts"
              style={subMenuStyle}
            >
              🏙 Districts
            </NavLink>
          </div>

          <NavLink to="/admin/settings" style={menuStyle}>
            ⚙️ Settings
          </NavLink>
        </div>

        {/* Bottom */}
        <div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #334155",
              marginBottom: "20px",
            }}
          />

          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                margin: "0 auto 10px",
              }}
            >
              👤
            </div>

            <h3 style={{ margin: 0 }}>Administrator</h3>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                marginTop: "5px",
              }}
            >
              VATS Innovation
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Right side */}
      <main
        style={{
          flex: 1,
          marginLeft: "260px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "70px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            Admin Dashboard
          </h2>

          <div
            style={{
              fontWeight: "bold",
              color: "#2563eb",
            }}
          >
            Welcome Admin 👋
          </div>
        </header>

        {/* Page content */}
        <div
          style={{
            padding: "30px",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}