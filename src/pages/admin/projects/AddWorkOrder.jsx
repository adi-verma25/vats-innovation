import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { createWorkOrder } from "../../../services/workOrderService";
import { getActiveEmployees } from "../../../services/employeeService";

export default function AddWorkOrder() {
  const navigate = useNavigate();
  const { stateId, districtId } = useParams();

  const [formData, setFormData] = useState({
    projectName: "",
    hospitalName: "",
    department: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "Medium",
    status: "Pending",
    progress: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] =
    useState(true);
  const [employeeError, setEmployeeError] = useState("");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const formatName = (value = "") => {
    return String(value)
      .split("-")
      .filter(Boolean)
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  const stateName = formatName(stateId);
  const districtName = formatName(districtId);

  const workOrdersPath =
    `/admin/projects/states/${stateId}/districts/${districtId}`;

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        setEmployeeError("");

        const employeeRecords = await getActiveEmployees();

        setEmployees(employeeRecords);
      } catch (error) {
        console.error("Unable to load employees:", error);

        setEmployeeError(
          error?.message ||
            "Unable to load employees from Firestore.",
        );
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch.trim().toLowerCase();

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
  }, [employeeSearch, employees]);

  const selectedEmployees = useMemo(() => {
    return employees.filter((employee) =>
      selectedEmployeeIds.includes(employee.id),
    );
  }, [employees, selectedEmployeeIds]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: name === "progress" ? Number(value) : value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployeeIds((previousIds) => {
      if (previousIds.includes(employeeId)) {
        return previousIds.filter((id) => id !== employeeId);
      }

      return [...previousIds, employeeId];
    });

    setErrors((previousErrors) => ({
      ...previousErrors,
      assignedEmployeeIds: "",
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployeeIds((previousIds) =>
      previousIds.filter((id) => id !== employeeId),
    );
  };

  const handleSelectAllVisible = () => {
    const visibleEmployeeIds = filteredEmployees.map(
      (employee) => employee.id,
    );

    setSelectedEmployeeIds((previousIds) => {
      return Array.from(
        new Set([...previousIds, ...visibleEmployeeIds]),
      );
    });
  };

  const handleClearAllEmployees = () => {
    setSelectedEmployeeIds([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required.";
    }

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = "Hospital name is required.";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required.";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required.";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required.";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <
        new Date(formData.startDate)
    ) {
      newErrors.endDate =
        "End date cannot be earlier than the start date.";
    }

    const progressNumber = Number(formData.progress);

    if (
      Number.isNaN(progressNumber) ||
      progressNumber < 0 ||
      progressNumber > 100
    ) {
      newErrors.progress =
        "Progress must be between 0 and 100.";
    }

    if (
      formData.status === "Completed" &&
      progressNumber !== 100
    ) {
      newErrors.progress =
        "Completed work orders must have 100% progress.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      const assignedEmployees = selectedEmployees.map(
        (employee) => ({
          id: employee.id,
          name: employee.name,
          employeeId: employee.employeeId,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
        }),
      );

      const createdWorkOrder = await createWorkOrder({
        ...formData,

        projectName: formData.projectName.trim(),
        hospitalName: formData.hospitalName.trim(),
        department: formData.department.trim(),
        description: formData.description.trim(),

        progress: Number(formData.progress),

        stateId,
        stateName,
        districtId,
        districtName,

        assignedEmployeeIds: selectedEmployeeIds,
        assignedEmployees,
      });

      setMessage({
        type: "success",
        text: `${createdWorkOrder.workOrderNumber} created successfully.`,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        navigate(workOrdersPath);
      }, 1200);
    } catch (error) {
      console.error("Error creating work order:", error);

      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to create the work order. Please try again.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(workOrdersPath);
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: errors[fieldName]
      ? "1px solid #dc2626"
      : "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
  });

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
  };

  const errorStyle = {
    margin: "6px 0 0",
    color: "#dc2626",
    fontSize: "13px",
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          padding: 0,
          marginBottom: "18px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          fontWeight: "700",
          fontSize: "15px",
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        ← Back to {districtName} Work Orders
      </button>

      <div style={{ marginBottom: "26px" }}>
        <h1
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "31px",
          }}
        >
          ➕ Add Work Order
        </h1>

        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
            color: "#64748b",
          }}
        >
          Create a new work order and assign employees for{" "}
          {districtName}, {stateName}.
        </p>
      </div>

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: "15px 18px",
          borderRadius: "12px",
          marginBottom: "22px",
          color: "#1e40af",
          fontSize: "14px",
        }}
      >
        <strong>Automatic Work Order Number:</strong> The system
        will generate the next number automatically, such as
        WO-0001.
      </div>

      {message.text && (
        <div
          style={{
            background:
              message.type === "success"
                ? "#dcfce7"
                : "#fee2e2",
            border:
              message.type === "success"
                ? "1px solid #86efac"
                : "1px solid #fca5a5",
            color:
              message.type === "success"
                ? "#166534"
                : "#b91c1c",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "22px",
            fontWeight: "600",
          }}
        >
          {message.type === "success" ? "✅ " : "❌ "}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "#ffffff",
            padding: "26px",
            borderRadius: "16px",
            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.08)",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "22px",
              paddingBottom: "16px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontSize: "24px" }}>📋</span>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "20px",
                }}
              >
                Work Order Information
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Enter project, hospital and schedule details.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "22px",
            }}
          >
            <div>
              <label htmlFor="projectName" style={labelStyle}>
                Project Name *
              </label>

              <input
                id="projectName"
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
                disabled={isSubmitting}
                style={inputStyle("projectName")}
              />

              {errors.projectName && (
                <p style={errorStyle}>
                  {errors.projectName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="hospitalName" style={labelStyle}>
                Hospital Name *
              </label>

              <input
                id="hospitalName"
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Enter hospital name"
                disabled={isSubmitting}
                style={inputStyle("hospitalName")}
              />

              {errors.hospitalName && (
                <p style={errorStyle}>
                  {errors.hospitalName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="department" style={labelStyle}>
                Department *
              </label>

              <input
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Example: Emergency Department"
                disabled={isSubmitting}
                style={inputStyle("department")}
              />

              {errors.department && (
                <p style={errorStyle}>
                  {errors.department}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="priority" style={labelStyle}>
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
                style={inputStyle("priority")}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" style={labelStyle}>
                Start Date *
              </label>

              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isSubmitting}
                style={inputStyle("startDate")}
              />

              {errors.startDate && (
                <p style={errorStyle}>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" style={labelStyle}>
                End Date *
              </label>

              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isSubmitting}
                style={inputStyle("endDate")}
              />

              {errors.endDate && (
                <p style={errorStyle}>
                  {errors.endDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" style={labelStyle}>
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                style={inputStyle("status")}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="progress" style={labelStyle}>
                Progress Percentage
              </label>

              <input
                id="progress"
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={isSubmitting}
                style={inputStyle("progress")}
              />

              {errors.progress && (
                <p style={errorStyle}>{errors.progress}</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Location</label>

              <div
                style={{
                  padding: "12px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "9px",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "15px",
                }}
              >
                {districtName}, {stateName}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "22px" }}>
            <label htmlFor="description" style={labelStyle}>
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project or work order description"
              rows="6"
              disabled={isSubmitting}
              style={{
                ...inputStyle("description"),
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "26px",
            borderRadius: "16px",
            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.08)",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "22px",
              paddingBottom: "16px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "24px" }}>👥</span>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "20px",
                  }}
                >
                  Assign Employees
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Select one or more employees for this work
                  order.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "8px 13px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "800",
              }}
            >
              {selectedEmployeeIds.length} Selected
            </div>
          </div>

          {employeeError && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                color: "#b91c1c",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "18px",
              }}
            >
              <strong>Unable to load employees</strong>

              <p style={{ margin: "6px 0 0" }}>
                {employeeError}
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <input
              type="text"
              value={employeeSearch}
              onChange={(event) =>
                setEmployeeSearch(event.target.value)
              }
              placeholder="Search employee name, email, ID or department..."
              disabled={
                isSubmitting ||
                isLoadingEmployees ||
                Boolean(employeeError)
              }
              style={{
                flex: "1 1 300px",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "9px",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <button
              type="button"
              onClick={handleSelectAllVisible}
              disabled={
                isSubmitting ||
                isLoadingEmployees ||
                filteredEmployees.length === 0
              }
              style={{
                border: "1px solid #93c5fd",
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "11px 16px",
                borderRadius: "9px",
                cursor:
                  isSubmitting ||
                  isLoadingEmployees ||
                  filteredEmployees.length === 0
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "700",
                opacity:
                  isSubmitting ||
                  isLoadingEmployees ||
                  filteredEmployees.length === 0
                    ? 0.6
                    : 1,
              }}
            >
              Select Visible
            </button>

            <button
              type="button"
              onClick={handleClearAllEmployees}
              disabled={
                isSubmitting ||
                selectedEmployeeIds.length === 0
              }
              style={{
                border: "1px solid #fca5a5",
                background: "#fff1f2",
                color: "#be123c",
                padding: "11px 16px",
                borderRadius: "9px",
                cursor:
                  isSubmitting ||
                  selectedEmployeeIds.length === 0
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "700",
                opacity:
                  isSubmitting ||
                  selectedEmployeeIds.length === 0
                    ? 0.6
                    : 1,
              }}
            >
              Clear Selection
            </button>
          </div>

          {selectedEmployees.length > 0 && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "18px",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  color: "#334155",
                  fontWeight: "800",
                  fontSize: "14px",
                }}
              >
                Selected Employees
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {selectedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      background: "#ffffff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "22px",
                      padding: "7px 9px 7px 12px",
                    }}
                  >
                    <span
                      style={{
                        color: "#1d4ed8",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {employee.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveEmployee(employee.id)
                      }
                      disabled={isSubmitting}
                      title={`Remove ${employee.name}`}
                      style={{
                        width: "23px",
                        height: "23px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        cursor: isSubmitting
                          ? "not-allowed"
                          : "pointer",
                        fontWeight: "900",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {isLoadingEmployees ? (
              <div
                style={{
                  padding: "45px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    marginBottom: "10px",
                  }}
                >
                  ⏳
                </div>

                <strong>Loading employees...</strong>
              </div>
            ) : employeeError ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#b91c1c",
                }}
              >
                Employees could not be loaded.
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div
                style={{
                  padding: "45px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                    marginBottom: "10px",
                  }}
                >
                  👤
                </div>

                <strong>No employees found.</strong>

                <p style={{ margin: "7px 0 0" }}>
                  {employees.length === 0
                    ? 'Create employee users with role: "employee" in Firestore.'
                    : "Try changing the employee search."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                }}
              >
                {filteredEmployees.map((employee) => {
                  const isSelected =
                    selectedEmployeeIds.includes(employee.id);

                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() =>
                        handleEmployeeToggle(employee.id)
                      }
                      disabled={isSubmitting}
                      style={{
                        border: "none",
                        borderBottom:
                          "1px solid #e2e8f0",
                        borderRight:
                          "1px solid #e2e8f0",
                        background: isSelected
                          ? "#eff6ff"
                          : "#ffffff",
                        padding: "17px",
                        cursor: isSubmitting
                          ? "not-allowed"
                          : "pointer",
                        textAlign: "left",
                        display: "flex",
                        gap: "13px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          minWidth: "22px",
                          borderRadius: "6px",
                          border: isSelected
                            ? "1px solid #2563eb"
                            : "1px solid #94a3b8",
                          background: isSelected
                            ? "#2563eb"
                            : "#ffffff",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "900",
                          marginTop: "2px",
                        }}
                      >
                        {isSelected ? "✓" : ""}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            color: "#0f172a",
                            fontSize: "15px",
                            fontWeight: "800",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employee.name}
                        </p>

                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#64748b",
                            fontSize: "13px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employee.designation}
                        </p>

                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#64748b",
                            fontSize: "12px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employee.department}
                        </p>

                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#2563eb",
                            fontSize: "12px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employee.email ||
                            employee.employeeId}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {errors.assignedEmployeeIds && (
            <p style={errorStyle}>
              {errors.assignedEmployeeIds}
            </p>
          )}

          <p
            style={{
              margin: "13px 0 0",
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            Employee assignment is optional. You can also assign
            or remove employees later from the Edit Work Order
            page.
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "22px 26px",
            borderRadius: "16px",
            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.08)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              padding: "12px 19px",
              borderRadius: "9px",
              cursor: isSubmitting
                ? "not-allowed"
                : "pointer",
              fontWeight: "700",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              border: "none",
              background: isSubmitting
                ? "#94a3b8"
                : "#2563eb",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "9px",
              cursor: isSubmitting
                ? "not-allowed"
                : "pointer",
              fontWeight: "700",
              minWidth: "180px",
              boxShadow: isSubmitting
                ? "none"
                : "0 4px 12px rgba(37, 99, 235, 0.25)",
            }}
          >
            {isSubmitting
              ? "Creating..."
              : "Create Work Order"}
          </button>
        </div>
      </form>
    </div>
  );
}