import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../../firebase/firebase";
import EmployeeForm from "../../../components/employees/EmployeeForm";

const initialEmployee = {
  name: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  salary: "",
  gender: "",
  dateOfBirth: "",
  joiningDate: "",
  status: "Active",
  address: "",
};

export default function EditEmployee() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(initialEmployee);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        if (!employeeId) {
          setMessage("Employee ID is missing.");
          return;
        }

        const employeeRef = doc(db, "employees", employeeId);
        const employeeSnapshot = await getDoc(employeeRef);

        if (!employeeSnapshot.exists()) {
          setMessage("Employee not found.");
          return;
        }

        const employeeData = employeeSnapshot.data();

        setEmployee({
          ...initialEmployee,
          ...employeeData,
          salary: employeeData.salary ?? "",
        });
      } catch (error) {
        console.error("Unable to load employee:", error);
        setMessage(error.message || "Unable to load employee.");
      } finally {
        setPageLoading(false);
      }
    };

    loadEmployee();
  }, [employeeId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEmployee((previousEmployee) => ({
      ...previousEmployee,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const employeeRef = doc(db, "employees", employeeId);

      await updateDoc(employeeRef, {
        ...employee,
        salary: employee.salary ? Number(employee.salary) : 0,
        updatedAt: serverTimestamp(),
      });

      setMessage("Employee updated successfully.");

      setTimeout(() => {
        navigate("/admin/employees");
      }, 1000);
    } catch (error) {
      console.error("Unable to update employee:", error);
      setMessage(error.message || "Unable to update employee.");
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return <h2>Loading employee...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ marginBottom: "8px", color: "#0f172a" }}>
          Edit Employee
        </h1>

        <p style={{ margin: 0, color: "#64748b" }}>
          Update employee information.
        </p>
      </div>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "8px",
            background: message.includes("successfully")
              ? "#dcfce7"
              : "#fee2e2",
            color: message.includes("successfully")
              ? "#166534"
              : "#991b1b",
          }}
        >
          {message}
        </div>
      )}

      {!message.includes("not found") &&
        !message.includes("missing") && (
          <EmployeeForm
            employee={employee}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={saving}
            buttonText="Update Employee"
          />
        )}
    </div>
  );
}