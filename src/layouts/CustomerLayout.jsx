import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

export default function CustomerLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          background: "#F8FAFC",
        }}
      >
        <Navbar />

        <div
          style={{
            padding: "30px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}