import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const getEmployeeName = (employee = {}) => {
  const fullName = String(employee.fullName || "").trim();

  if (fullName) {
    return fullName;
  }

  const name = String(employee.name || "").trim();

  if (name) {
    return name;
  }

  const firstName = String(employee.firstName || "").trim();
  const lastName = String(employee.lastName || "").trim();

  const combinedName = `${firstName} ${lastName}`.trim();

  if (combinedName) {
    return combinedName;
  }

  const displayName = String(
    employee.displayName || "",
  ).trim();

  if (displayName) {
    return displayName;
  }

  const email = String(employee.email || "").trim();

  if (email) {
    return email;
  }

  return "Unnamed Employee";
};

const normalizeEmployee = (documentSnapshot) => {
  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,

    ...data,

    name: getEmployeeName(data),

    email: data.email || "",

    phone:
      data.phone ||
      data.phoneNumber ||
      data.mobile ||
      data.mobileNumber ||
      "",

    employeeId:
      data.employeeId ||
      data.employeeCode ||
      data.staffId ||
      documentSnapshot.id,

    department:
      data.department ||
      data.departmentName ||
      "Not assigned",

    designation:
      data.designation ||
      data.position ||
      data.jobTitle ||
      "Employee",

    role: String(data.role || "")
      .trim()
      .toLowerCase(),

    status:
      data.status ||
      data.employmentStatus ||
      "Active",
  };
};

export const getAllEmployees = async () => {
  try {
    const usersReference = collection(db, "users");

    let snapshot;

    try {
      const employeesQuery = query(
        usersReference,
        where("role", "==", "employee"),
      );

      snapshot = await getDocs(employeesQuery);
    } catch (queryError) {
      console.warn(
        "Employee role query failed. Loading all users as fallback:",
        queryError,
      );

      snapshot = await getDocs(usersReference);
    }

    const employees = snapshot.docs
      .map(normalizeEmployee)
      .filter((employee) => {
        return employee.role === "employee";
      });

    return employees.sort((firstEmployee, secondEmployee) =>
      firstEmployee.name.localeCompare(secondEmployee.name),
    );
  } catch (error) {
    console.error("Error loading employees:", error);

    throw new Error(
      error?.message ||
        "Unable to load employees from Firestore.",
    );
  }
};

export const getActiveEmployees = async () => {
  const employees = await getAllEmployees();

  return employees.filter((employee) => {
    const status = String(employee.status || "")
      .trim()
      .toLowerCase();

    return (
      status === "" ||
      status === "active" ||
      status === "approved" ||
      status === "working"
    );
  });
};

export const getEmployeeById = async (employeeId) => {
  if (!employeeId) {
    return null;
  }

  const employees = await getAllEmployees();

  return (
    employees.find(
      (employee) => employee.id === employeeId,
    ) || null
  );
};

export const getEmployeesByIds = async (
  employeeIds = [],
) => {
  if (
    !Array.isArray(employeeIds) ||
    employeeIds.length === 0
  ) {
    return [];
  }

  const uniqueEmployeeIds = [...new Set(employeeIds)];

  const employees = await getAllEmployees();

  return employees.filter((employee) =>
    uniqueEmployeeIds.includes(employee.id),
  );
};

export const searchEmployees = async (
  searchText = "",
) => {
  const employees = await getAllEmployees();

  const keyword = String(searchText)
    .trim()
    .toLowerCase();

  if (!keyword) {
    return employees;
  }

  return employees.filter((employee) => {
    const searchableValues = [
      employee.name,
      employee.email,
      employee.employeeId,
      employee.department,
      employee.designation,
      employee.phone,
    ];

    return searchableValues.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(keyword),
    );
  });
};