import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

export default function AddEmployee() {
  const [employee, setEmployee] = useState(initialEmployee);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEmployee((previousEmployee) => ({
      ...previousEmployee,
      [name]: value,
    }));
  };

  const generateEmployeeId = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `VATS-${new Date().getFullYear()}-${randomNumber}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const employeeData = {
        ...employee,
        salary: employee.salary ? Number(employee.salary) : 0,
        employeeId: generateEmployeeId(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "employees"), employeeData);

      setMessage("Employee added successfully.");
      setEmployee(initialEmployee);
    } catch (error) {
      console.error("Error adding employee:", error);
      setMessage(error.message || "Unable to add employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
            color: "#0f172a",
          }}
        >
          Add Employee
        </h1>

        <p
          style={{
            color: "#64748b",
            margin: 0,
          }}
        >
          Enter the employee&apos;s personal and employment details.
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

      <EmployeeForm
        employee={employee}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
        buttonText="Add Employee"
      />
    </div>
  );
}