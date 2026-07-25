import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const employeesQuery = query(
      collection(db, "employees"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      employeesQuery,
      (snapshot) => {
        const employeeData = snapshot.docs.map((employeeDoc) => ({
          id: employeeDoc.id,
          ...employeeDoc.data(),
        }));

        setEmployees(employeeData);
        setLoading(false);
      },
      (error) => {
        console.error("Unable to load employees:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredEmployees = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.name?.toLowerCase().includes(searchText) ||
        employee.email?.toLowerCase().includes(searchText) ||
        employee.employeeId?.toLowerCase().includes(searchText) ||
        employee.department?.toLowerCase().includes(searchText) ||
        employee.position?.toLowerCase().includes(searchText)
      );
    });
  }, [employees, search]);

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(employee.id);

      await deleteDoc(doc(db, "employees", employee.id));

      alert("Employee deleted successfully.");
    } catch (error) {
      console.error("Unable to delete employee:", error);
      alert(error.message || "Unable to delete employee.");
    } finally {
      setDeletingId("");
    }
  };

  const formatSalary = (salary) => {
    const amount = Number(salary || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <h2>Loading employees...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 8px",
              color: "#0f172a",
            }}
          >
            Employees
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Total employees: {employees.length}
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employee..."
          style={{
            width: "320px",
            maxWidth: "100%",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "14px",
            color: "#64748b",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          No employees found.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            background: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "950px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  textAlign: "left",
                }}
              >
                <th style={headerStyle}>Employee</th>
                <th style={headerStyle}>Employee ID</th>
                <th style={headerStyle}>Department</th>
                <th style={headerStyle}>Designation</th>
                <th style={headerStyle}>Salary</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  style={{
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <td style={cellStyle}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                    >
                      {employee.name || "Unnamed employee"}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      {employee.email || "No email"}
                    </div>
                  </td>

                  <td style={cellStyle}>
                    {employee.employeeId || "Not assigned"}
                  </td>

                  <td style={cellStyle}>
                    {employee.department || "Not assigned"}
                  </td>

                  <td style={cellStyle}>
                    {employee.position || "Not assigned"}
                  </td>

                  <td style={cellStyle}>
                    {formatSalary(employee.salary)}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background:
                          employee.status === "Inactive"
                            ? "#fee2e2"
                            : "#dcfce7",
                        color:
                          employee.status === "Inactive"
                            ? "#991b1b"
                            : "#166534",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {employee.status || "Active"}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <button
                      type="button"
                      onClick={() => handleDelete(employee)}
                      disabled={deletingId === employee.id}
                      style={{
                        padding: "9px 14px",
                        border: "none",
                        borderRadius: "8px",
                        background:
                          deletingId === employee.id
                            ? "#94a3b8"
                            : "#dc2626",
                        color: "#ffffff",
                        cursor:
                          deletingId === employee.id
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {deletingId === employee.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const headerStyle = {
  padding: "16px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "700",
  whiteSpace: "nowrap",
};

const cellStyle = {
  padding: "16px",
  color: "#334155",
  fontSize: "14px",
  verticalAlign: "middle",
};