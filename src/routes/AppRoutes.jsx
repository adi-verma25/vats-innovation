import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Authentication
import Login from "../pages/auth/Login";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";
import CustomerLayout from "../layouts/CustomerLayout";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";

import EmployeeList from "../pages/admin/employees/EmployeeList";
import AddEmployee from "../pages/admin/employees/AddEmployee";

import AttendanceList from "../pages/admin/attendance/AttendanceList";

import ProjectsDashboard from "../pages/admin/projects/Dashboard";
import States from "../pages/admin/projects/States";
import StateDetails from "../pages/admin/projects/StateDetails";
import Districts from "../pages/admin/projects/Districts";
import DistrictWorkOrders from "../pages/admin/projects/DistrictWorkOrders";
import AddWorkOrder from "../pages/admin/projects/AddWorkOrder";
import ViewAdminWorkOrder from "../pages/admin/projects/ViewWorkOrder";
import EditWorkOrder from "../pages/admin/projects/EditWorkOrder";

// Employee pages
import EmployeeDashboard from "../pages/employee/Dashboard";
import MyWorkOrders from "../pages/employee/MyWorkOrders";
import ViewEmployeeWorkOrder from "../pages/employee/ViewWorkOrder";
import UpdateProgress from "../pages/employee/UpdateProgress";
import MarkAttendance from "../pages/employee/attendance/MarkAttendance";
import EmployeeProfile from "../pages/employee/Profile";

// Customer pages
import CustomerDashboard from "../pages/customer/Dashboard";

/*
  This component handles the older district URL:

  /admin/projects/states/bihar/districts/vaishali

  and redirects it to:

  /admin/projects/states/bihar/districts/vaishali/work-orders
*/
function DistrictRedirect() {
  const { stateId, districtId } = useParams();

  return (
    <Navigate
      to={`/admin/projects/states/${stateId}/districts/${districtId}/work-orders`}
      replace
    />
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= LOGIN ================= */}

        <Route path="/" element={<Login />} />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* Employee Management */}

          <Route path="employees" element={<EmployeeList />} />

          <Route
            path="employees/add"
            element={<AddEmployee />}
          />

          {/* Attendance */}

          <Route
            path="attendance"
            element={<AttendanceList />}
          />

          {/* Projects */}

          <Route
            path="projects"
            element={<ProjectsDashboard />}
          />

          <Route
            path="projects/states"
            element={<States />}
          />

          <Route
            path="projects/states/:stateId"
            element={<StateDetails />}
          />

          <Route
            path="projects/states/:stateId/districts"
            element={<Districts />}
          />

          {/* Old district URL redirect */}

          <Route
            path="projects/states/:stateId/districts/:districtId"
            element={<DistrictRedirect />}
          />

          {/* District Work Orders */}

          <Route
            path="projects/states/:stateId/districts/:districtId/work-orders"
            element={<DistrictWorkOrders />}
          />

          <Route
            path="projects/states/:stateId/districts/:districtId/work-orders/add"
            element={<AddWorkOrder />}
          />

          <Route
            path="projects/states/:stateId/districts/:districtId/work-orders/:workOrderId"
            element={<ViewAdminWorkOrder />}
          />

          <Route
            path="projects/states/:stateId/districts/:districtId/work-orders/:workOrderId/edit"
            element={<EditWorkOrder />}
          />
        </Route>

        {/* ================= EMPLOYEE ROUTES ================= */}

        <Route
          path="/employee"
          element={
            <ProtectedRoute user={user} allowedRoles={["employee"]}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />

          <Route
            path="work-orders"
            element={<MyWorkOrders />}
          />

          <Route
            path="work-orders/:workOrderId"
            element={<ViewEmployeeWorkOrder />}
          />

          <Route
            path="work-orders/:workOrderId/update-progress"
            element={<UpdateProgress />}
          />

          <Route
            path="attendance"
            element={<MarkAttendance />}
          />

          <Route
            path="profile"
            element={<EmployeeProfile />}
          />
        </Route>

        {/* ================= CUSTOMER ROUTES ================= */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute user={user} allowedRoles={["customer"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
        </Route>

        {/* ================= INVALID ROUTE ================= */}

        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "30px",
                textAlign: "center",
              }}
            >
              <h1 style={{ marginBottom: "10px" }}>
                Page Not Found
              </h1>

              <p style={{ color: "#64748b" }}>
                The page URL does not match any route.
              </p>

              <Navigate to="/" replace />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;