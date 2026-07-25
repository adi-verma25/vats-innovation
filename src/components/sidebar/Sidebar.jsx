import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#0F172A",
        color: "white",
        padding: "20px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "40px",
          color: "#38BDF8",
        }}
      >
        VATS ERP
      </h2>

      <Link
        to="/admin"
        style={linkStyle}
      >
        📊 Dashboard
      </Link>

      <Link
        to="/admin/employees"
        style={linkStyle}
      >
        👨‍💼 Employees
      </Link>

      <Link
        to="/admin/customers"
        style={linkStyle}
      >
        👥 Customers
      </Link>

      <Link
        to="/admin/workorders"
        style={linkStyle}
      >
        📄 Work Orders
      </Link>

      <Link
        to="/admin/reports"
        style={linkStyle}
      >
        📈 Reports
      </Link>

      <Link
        to="/admin/settings"
        style={linkStyle}
      >
        ⚙ Settings
      </Link>
    </div>
  );
}

const linkStyle = {
  display: "block",
  color: "white",
  textDecoration: "none",
  marginBottom: "18px",
  fontSize: "17px",
};