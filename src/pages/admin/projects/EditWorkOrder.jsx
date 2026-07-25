import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getWorkOrderById,
  updateWorkOrder,
} from "../../../services/workOrderService";

import {
  getActiveEmployees,
} from "../../../services/employeeService";

export default function EditWorkOrder() {
  const navigate = useNavigate();

  const {
    stateId,
    districtId,
    workOrderId,
  } = useParams();

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
  const [selectedEmployeeIds, setSelectedEmployeeIds] =
    useState([]);
  const [employeeSearch, setEmployeeSearch] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [
    isLoadingEmployees,
    setIsLoadingEmployees,
  ] = useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [loadError, setLoadError] = useState("");
  const [employeeError, setEmployeeError] =
    useState("");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const formatSlug = (value = "") => {
    return String(value)
      .split("-")
      .filter(Boolean)
      .map((word) => {
        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );
      })
      .join(" ");
  };

  const stateName = formatSlug(stateId);
  const districtName = formatSlug(districtId);

  const workOrdersPath =
    `/admin/projects/states/${stateId}` +
    `/districts/${districtId}`;

  const viewWorkOrderPath =
    `/admin/projects/states/${stateId}` +
    `/districts/${districtId}` +
    `/work-orders/${workOrderId}`;

  useEffect(() => {
    const loadPageData = async () => {
      if (!workOrderId) {
        setLoadError(
          "Work order ID is missing from the URL.",
        );

        setIsLoading(false);
        setIsLoadingEmployees(false);

        return;
      }

      try {
        setIsLoading(true);
        setIsLoadingEmployees(true);
        setLoadError("");
        setEmployeeError("");

        const [
          workOrderRecord,
          employeeRecords,
        ] = await Promise.all([
          getWorkOrderById(workOrderId),
          getActiveEmployees(),
        ]);

        if (!workOrderRecord) {
          setLoadError(
            "The requested work order was not found.",
          );

          return;
        }

        setFormData({
          projectName:
            workOrderRecord.projectName || "",

          hospitalName:
            workOrderRecord.hospitalName || "",

          department:
            workOrderRecord.department || "",

          description:
            workOrderRecord.description || "",

          startDate: convertToInputDate(
            workOrderRecord.startDate,
          ),

          endDate: convertToInputDate(
            workOrderRecord.endDate,
          ),

          priority:
            workOrderRecord.priority || "Medium",

          status:
            workOrderRecord.status || "Pending",

          progress: Number(
            workOrderRecord.progress || 0,
          ),
        });

        const savedEmployeeIds = Array.isArray(
          workOrderRecord.assignedEmployeeIds,
        )
          ? workOrderRecord.assignedEmployeeIds
          : Array.isArray(
                workOrderRecord.assignedEmployees,
              )
            ? workOrderRecord.assignedEmployees
                .map((employee) => employee?.id)
                .filter(Boolean)
            : [];

        setSelectedEmployeeIds(
          Array.from(new Set(savedEmployeeIds)),
        );

        setEmployees(employeeRecords);
      } catch (error) {
        console.error(
          "Unable to load edit work order page:",
          error,
        );

        setLoadError(
          error?.message ||
            "Unable to load the work order.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingEmployees(false);
      }
    };

    loadPageData();
  }, [workOrderId]);

  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch
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
  }, [employeeSearch, employees]);

  const selectedEmployees = useMemo(() => {
    return employees.filter((employee) =>
      selectedEmployeeIds.includes(employee.id),
    );
  }, [employees, selectedEmployeeIds]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,

      [name]:
        name === "progress"
          ? Number(value)
          : value,
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

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value;

    setFormData((previousData) => ({
      ...previousData,
      status: nextStatus,

      progress:
        nextStatus === "Completed"
          ? 100
          : previousData.progress,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      status: "",
      progress: "",
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleProgressSliderChange = (event) => {
    const progress = Number(event.target.value);

    setFormData((previousData) => ({
      ...previousData,
      progress,

      status:
        progress === 100
          ? "Completed"
          : previousData.status === "Completed"
            ? "In Progress"
            : previousData.status,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      progress: "",
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployeeIds((previousIds) => {
      if (previousIds.includes(employeeId)) {
        return previousIds.filter(
          (id) => id !== employeeId,
        );
      }

      return [
        ...previousIds,
        employeeId,
      ];
    });

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployeeIds((previousIds) =>
      previousIds.filter(
        (id) => id !== employeeId,
      ),
    );
  };

  const handleSelectVisible = () => {
    const visibleEmployeeIds =
      filteredEmployees.map(
        (employee) => employee.id,
      );

    setSelectedEmployeeIds((previousIds) =>
      Array.from(
        new Set([
          ...previousIds,
          ...visibleEmployeeIds,
        ]),
      ),
    );
  };

  const handleClearEmployees = () => {
    setSelectedEmployeeIds([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName =
        "Project name is required.";
    }

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName =
        "Hospital name is required.";
    }

    if (!formData.department.trim()) {
      newErrors.department =
        "Department is required.";
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Start date is required.";
    }

    if (!formData.endDate) {
      newErrors.endDate =
        "End date is required.";
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

    const progress = Number(
      formData.progress,
    );

    if (
      Number.isNaN(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      newErrors.progress =
        "Progress must be between 0 and 100.";
    }

    if (
      formData.status === "Completed" &&
      progress !== 100
    ) {
      newErrors.progress =
        "Completed work orders must have 100% progress.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
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

      const assignedEmployees =
        selectedEmployees.map((employee) => ({
          id: employee.id,

          name: employee.name,

          employeeId:
            employee.employeeId || "",

          email:
            employee.email || "",

          department:
            employee.department || "",

          designation:
            employee.designation || "",
        }));

      await updateWorkOrder(
        workOrderId,
        {
          projectName:
            formData.projectName.trim(),

          hospitalName:
            formData.hospitalName.trim(),

          department:
            formData.department.trim(),

          description:
            formData.description.trim(),

          startDate:
            formData.startDate,

          endDate:
            formData.endDate,

          priority:
            formData.priority,

          status:
            formData.status,

          progress: Number(
            formData.progress,
          ),

          assignedEmployeeIds:
            selectedEmployeeIds,

          assignedEmployees,
        },
      );

      setMessage({
        type: "success",
        text:
          "Work order updated successfully.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        navigate(viewWorkOrderPath);
      }, 1200);
    } catch (error) {
      console.error(
        "Unable to update work order:",
        error,
      );

      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to update the work order.",
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
    navigate(viewWorkOrderPath);
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

  if (isLoading) {
    return (
      <div
        style={{
          background: "#ffffff",

          borderRadius: "16px",

          padding: "70px 25px",

          textAlign: "center",

          boxShadow:
            "0 5px 20px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: "46px",
            marginBottom: "15px",
          }}
        >
          ⏳
        </div>

        <h2
          style={{
            margin: 0,
            color: "#0f172a",
          }}
        >
          Loading work order...
        </h2>

        <p
          style={{
            margin: "10px 0 0",
            color: "#64748b",
          }}
        >
          Please wait while the editable
          information is loaded.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(workOrdersPath)
          }
          style={backButtonStyle}
        >
          ← Back to Work Orders
        </button>

        <div
          style={{
            background: "#ffffff",

            borderRadius: "16px",

            padding: "60px 25px",

            textAlign: "center",

            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              margin: 0,
              color: "#b91c1c",
            }}
          >
            Unable to Edit Work Order
          </h2>

          <p
            style={{
              margin: "12px auto 22px",

              maxWidth: "560px",

              color: "#64748b",

              lineHeight: "1.6",
            }}
          >
            {loadError}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(workOrdersPath)
            }
            style={{
              border: "none",

              background: "#2563eb",

              color: "#ffffff",

              padding: "12px 19px",

              borderRadius: "9px",

              cursor: "pointer",

              fontWeight: "700",
            }}
          >
            Return to Work Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        style={{
          ...backButtonStyle,

          cursor: isSubmitting
            ? "not-allowed"
            : "pointer",

          opacity: isSubmitting
            ? 0.6
            : 1,
        }}
      >
        ← Back to Work Order Details
      </button>

      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "flex-start",

          flexWrap: "wrap",

          gap: "18px",

          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,

              color: "#0f172a",

              fontSize: "31px",
            }}
          >
            ✏️ Edit Work Order
          </h1>

          <p
            style={{
              margin: "8px 0 0",

              color: "#64748b",
            }}
          >
            Update project information,
            progress and employee assignments
            for {districtName}, {stateName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(viewWorkOrderPath)
          }
          disabled={isSubmitting}
          style={{
            border:
              "1px solid #cbd5e1",

            background: "#ffffff",

            color: "#334155",

            padding: "12px 17px",

            borderRadius: "9px",

            cursor: isSubmitting
              ? "not-allowed"
              : "pointer",

            fontWeight: "700",

            opacity: isSubmitting
              ? 0.6
              : 1,
          }}
        >
          View Work Order
        </button>
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
          {message.type === "success"
            ? "✅ "
            : "❌ "}

          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section style={cardStyle}>
          <SectionHeader
            icon="📋"
            title="Work Order Information"
            description="Update the main project and schedule information."
          />

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",

              gap: "22px",
            }}
          >
            <FormField
              label="Project Name *"
              error={errors.projectName}
            >
              <input
                type="text"

                name="projectName"

                value={formData.projectName}

                onChange={handleChange}

                disabled={isSubmitting}

                placeholder="Enter project name"

                style={inputStyle(
                  "projectName",
                )}
              />
            </FormField>

            <FormField
              label="Hospital Name *"
              error={errors.hospitalName}
            >
              <input
                type="text"

                name="hospitalName"

                value={formData.hospitalName}

                onChange={handleChange}

                disabled={isSubmitting}

                placeholder="Enter hospital name"

                style={inputStyle(
                  "hospitalName",
                )}
              />
            </FormField>

            <FormField
              label="Department *"
              error={errors.department}
            >
              <input
                type="text"

                name="department"

                value={formData.department}

                onChange={handleChange}

                disabled={isSubmitting}

                placeholder="Enter department"

                style={inputStyle(
                  "department",
                )}
              />
            </FormField>

            <FormField label="Priority">
              <select
                name="priority"

                value={formData.priority}

                onChange={handleChange}

                disabled={isSubmitting}

                style={inputStyle(
                  "priority",
                )}
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

                <option value="Urgent">
                  Urgent
                </option>
              </select>
            </FormField>

            <FormField
              label="Start Date *"
              error={errors.startDate}
            >
              <input
                type="date"

                name="startDate"

                value={formData.startDate}

                onChange={handleChange}

                disabled={isSubmitting}

                style={inputStyle(
                  "startDate",
                )}
              />
            </FormField>

            <FormField
              label="End Date *"
              error={errors.endDate}
            >
              <input
                type="date"

                name="endDate"

                value={formData.endDate}

                onChange={handleChange}

                disabled={isSubmitting}

                style={inputStyle(
                  "endDate",
                )}
              />
            </FormField>

            <FormField label="Status">
              <select
                name="status"

                value={formData.status}

                onChange={
                  handleStatusChange
                }

                disabled={isSubmitting}

                style={inputStyle(
                  "status",
                )}
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="On Hold">
                  On Hold
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </FormField>

            <FormField label="Location">
              <div
                style={{
                  padding: "12px 14px",

                  border:
                    "1px solid #e2e8f0",

                  borderRadius: "9px",

                  background: "#f8fafc",

                  color: "#475569",

                  fontSize: "15px",
                }}
              >
                {districtName}, {stateName}
              </div>
            </FormField>
          </div>

          <div
            style={{
              marginTop: "22px",
            }}
          >
            <label style={labelStyle}>
              Description
            </label>

            <textarea
              name="description"

              value={formData.description}

              onChange={handleChange}

              disabled={isSubmitting}

              placeholder="Enter work order description"

              rows="6"

              style={{
                ...inputStyle(
                  "description",
                ),

                resize: "vertical",

                fontFamily: "inherit",
              }}
            />
          </div>
        </section>

        <section style={cardStyle}>
          <SectionHeader
            icon="📈"
            title="Progress Management"
            description="Update the completion percentage and current work status."
          />

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",

              gap: "24px",

              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  gap: "14px",

                  marginBottom: "12px",
                }}
              >
                <label
                  htmlFor="progressRange"
                  style={{
                    ...labelStyle,

                    marginBottom: 0,
                  }}
                >
                  Completion Progress
                </label>

                <span
                  style={{
                    color: "#2563eb",

                    fontSize: "22px",

                    fontWeight: "900",
                  }}
                >
                  {formData.progress}%
                </span>
              </div>

              <input
                id="progressRange"

                type="range"

                min="0"

                max="100"

                step="1"

                value={formData.progress}

                onChange={
                  handleProgressSliderChange
                }

                disabled={isSubmitting}

                style={{
                  width: "100%",

                  cursor: isSubmitting
                    ? "not-allowed"
                    : "pointer",
                }}
              />

              {errors.progress && (
                <p style={errorStyle}>
                  {errors.progress}
                </p>
              )}

              <div
                style={{
                  marginTop: "14px",

                  width: "100%",

                  height: "14px",

                  borderRadius: "20px",

                  overflow: "hidden",

                  background: "#e2e8f0",
                }}
              >
                <div
                  style={{
                    width:
                      `${formData.progress}%`,

                    height: "100%",

                    borderRadius: "20px",

                    background:
                      formData.progress === 100
                        ? "#16a34a"
                        : "#2563eb",

                    transition:
                      "width 0.25s ease",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                Exact Percentage
              </label>

              <input
                type="number"

                name="progress"

                min="0"

                max="100"

                value={formData.progress}

                onChange={handleChange}

                disabled={isSubmitting}

                style={inputStyle(
                  "progress",
                )}
              />

              <p
                style={{
                  margin: "8px 0 0",

                  color: "#64748b",

                  fontSize: "13px",

                  lineHeight: "1.5",
                }}
              >
                Setting progress to 100%
                automatically marks the work
                order as completed.
              </p>
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems: "flex-start",

              gap: "16px",

              flexWrap: "wrap",

              marginBottom: "22px",

              paddingBottom: "16px",

              borderBottom:
                "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",

                gap: "11px",

                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "25px",
                }}
              >
                👥
              </span>

              <div>
                <h2
                  style={{
                    margin: 0,

                    color: "#0f172a",

                    fontSize: "20px",
                  }}
                >
                  Assigned Employees
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",

                    color: "#64748b",

                    fontSize: "13px",
                  }}
                >
                  Add or remove employees
                  assigned to this work order.
                </p>
              </div>
            </div>

            <span
              style={{
                background: "#eff6ff",

                color: "#1d4ed8",

                borderRadius: "20px",

                padding: "8px 13px",

                fontSize: "13px",

                fontWeight: "800",
              }}
            >
              {selectedEmployeeIds.length}
              {" "}
              Selected
            </span>
          </div>

          {employeeError && (
            <div
              style={{
                background: "#fee2e2",

                border:
                  "1px solid #fca5a5",

                color: "#b91c1c",

                borderRadius: "10px",

                padding: "14px 16px",

                marginBottom: "18px",
              }}
            >
              <strong>
                Unable to load employees
              </strong>

              <p
                style={{
                  margin: "6px 0 0",
                }}
              >
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
                setEmployeeSearch(
                  event.target.value,
                )
              }

              disabled={
                isSubmitting ||
                isLoadingEmployees ||
                Boolean(employeeError)
              }

              placeholder="Search employees by name, email, ID or department..."

              style={{
                flex: "1 1 320px",

                boxSizing: "border-box",

                padding: "12px 14px",

                border:
                  "1px solid #cbd5e1",

                borderRadius: "9px",

                fontSize: "15px",

                outline: "none",
              }}
            />

            <button
              type="button"

              onClick={handleSelectVisible}

              disabled={
                isSubmitting ||
                isLoadingEmployees ||
                filteredEmployees.length === 0
              }

              style={secondaryActionStyle(
                "#eff6ff",
                "#1d4ed8",
                "#93c5fd",
                isSubmitting ||
                  isLoadingEmployees ||
                  filteredEmployees.length === 0,
              )}
            >
              Select Visible
            </button>

            <button
              type="button"

              onClick={
                handleClearEmployees
              }

              disabled={
                isSubmitting ||
                selectedEmployeeIds.length === 0
              }

              style={secondaryActionStyle(
                "#fff1f2",
                "#be123c",
                "#fca5a5",
                isSubmitting ||
                  selectedEmployeeIds.length === 0,
              )}
            >
              Clear Selection
            </button>
          </div>

          {selectedEmployees.length > 0 && (
            <div
              style={{
                background: "#f8fafc",

                border:
                  "1px solid #e2e8f0",

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
                Currently Assigned
              </p>

              <div
                style={{
                  display: "flex",

                  flexWrap: "wrap",

                  gap: "10px",
                }}
              >
                {selectedEmployees.map(
                  (employee) => (
                    <div
                      key={employee.id}
                      style={{
                        display: "flex",

                        alignItems:
                          "center",

                        gap: "9px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #bfdbfe",

                        borderRadius:
                          "22px",

                        padding:
                          "7px 9px 7px 12px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#1d4ed8",

                          fontSize:
                            "13px",

                          fontWeight:
                            "700",
                        }}
                      >
                        {employee.name}
                      </span>

                      <button
                        type="button"

                        onClick={() =>
                          handleRemoveEmployee(
                            employee.id,
                          )
                        }

                        disabled={
                          isSubmitting
                        }

                        title={
                          `Remove ${employee.name}`
                        }

                        style={{
                          width: "23px",

                          height: "23px",

                          borderRadius:
                            "50%",

                          border: "none",

                          background:
                            "#fee2e2",

                          color:
                            "#b91c1c",

                          cursor:
                            isSubmitting
                              ? "not-allowed"
                              : "pointer",

                          fontWeight:
                            "900",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          <div
            style={{
              border:
                "1px solid #e2e8f0",

              borderRadius: "12px",

              overflow: "hidden",
            }}
          >
            {isLoadingEmployees ? (
              <div
                style={{
                  padding:
                    "45px 20px",

                  textAlign:
                    "center",

                  color:
                    "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "36px",

                    marginBottom:
                      "10px",
                  }}
                >
                  ⏳
                </div>

                <strong>
                  Loading employees...
                </strong>
              </div>
            ) : employeeError ? (
              <div
                style={{
                  padding:
                    "40px 20px",

                  textAlign:
                    "center",

                  color:
                    "#b91c1c",
                }}
              >
                Employees could not be
                loaded.
              </div>
            ) : filteredEmployees.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "45px 20px",

                  textAlign:
                    "center",

                  color:
                    "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "38px",

                    marginBottom:
                      "10px",
                  }}
                >
                  👤
                </div>

                <strong>
                  No employees found.
                </strong>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                  }}
                >
                  {employees.length === 0
                    ? 'Create users with role: "employee" in Firestore.'
                    : "Try changing the search text."}
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
                {filteredEmployees.map(
                  (employee) => {
                    const isSelected =
                      selectedEmployeeIds.includes(
                        employee.id,
                      );

                    return (
                      <button
                        key={
                          employee.id
                        }

                        type="button"

                        onClick={() =>
                          handleEmployeeToggle(
                            employee.id,
                          )
                        }

                        disabled={
                          isSubmitting
                        }

                        style={{
                          border:
                            "none",

                          borderBottom:
                            "1px solid #e2e8f0",

                          borderRight:
                            "1px solid #e2e8f0",

                          background:
                            isSelected
                              ? "#eff6ff"
                              : "#ffffff",

                          padding:
                            "17px",

                          cursor:
                            isSubmitting
                              ? "not-allowed"
                              : "pointer",

                          textAlign:
                            "left",

                          display:
                            "flex",

                          gap: "13px",

                          alignItems:
                            "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width:
                              "22px",

                            height:
                              "22px",

                            minWidth:
                              "22px",

                            borderRadius:
                              "6px",

                            border:
                              isSelected
                                ? "1px solid #2563eb"
                                : "1px solid #94a3b8",

                            background:
                              isSelected
                                ? "#2563eb"
                                : "#ffffff",

                            color:
                              "#ffffff",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            fontWeight:
                              "900",

                            marginTop:
                              "2px",
                          }}
                        >
                          {isSelected
                            ? "✓"
                            : ""}
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <p
                            style={{
                              margin:
                                0,

                              color:
                                "#0f172a",

                              fontSize:
                                "15px",

                              fontWeight:
                                "800",

                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {
                              employee.name
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "5px 0 0",

                              color:
                                "#64748b",

                              fontSize:
                                "13px",
                            }}
                          >
                            {
                              employee.designation
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "4px 0 0",

                              color:
                                "#64748b",

                              fontSize:
                                "12px",
                            }}
                          >
                            {
                              employee.department
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "4px 0 0",

                              color:
                                "#2563eb",

                              fontSize:
                                "12px",

                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {employee.email ||
                              employee.employeeId}
                          </p>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>

        <div
          style={{
            background: "#ffffff",

            padding: "22px 26px",

            borderRadius: "16px",

            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.08)",

            display: "flex",

            justifyContent:
              "flex-end",

            gap: "12px",

            flexWrap: "wrap",
          }}
        >
          <button
            type="button"

            onClick={handleCancel}

            disabled={isSubmitting}

            style={{
              border:
                "1px solid #cbd5e1",

              background:
                "#ffffff",

              color: "#334155",

              padding:
                "12px 19px",

              borderRadius:
                "9px",

              cursor:
                isSubmitting
                  ? "not-allowed"
                  : "pointer",

              fontWeight:
                "700",

              opacity:
                isSubmitting
                  ? 0.6
                  : 1,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"

            disabled={isSubmitting}

            style={{
              border: "none",

              background:
                isSubmitting
                  ? "#94a3b8"
                  : "#2563eb",

              color: "#ffffff",

              padding:
                "12px 21px",

              borderRadius:
                "9px",

              cursor:
                isSubmitting
                  ? "not-allowed"
                  : "pointer",

              fontWeight:
                "700",

              minWidth:
                "180px",

              boxShadow:
                isSubmitting
                  ? "none"
                  : "0 4px 12px rgba(37, 99, 235, 0.25)",
            }}
          >
            {isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function convertToInputDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  let date;

  if (
    typeof dateValue === "object" &&
    typeof dateValue.toDate === "function"
  ) {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    const text = String(dateValue);

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {
      return text;
    }

    date = new Date(text);
  }

  if (
    !date ||
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function FormField({
  label,
  error,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",

          marginBottom: "7px",

          color: "#334155",

          fontSize: "14px",

          fontWeight: "700",
        }}
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          style={{
            margin: "6px 0 0",

            color: "#dc2626",

            fontSize: "13px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div
      style={{
        display: "flex",

        gap: "11px",

        alignItems: "flex-start",

        paddingBottom: "16px",

        marginBottom: "22px",

        borderBottom:
          "1px solid #e2e8f0",
      }}
    >
      <span
        style={{
          fontSize: "25px",
        }}
      >
        {icon}
      </span>

      <div>
        <h2
          style={{
            margin: 0,

            color: "#0f172a",

            fontSize: "20px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "5px 0 0",

            color: "#64748b",

            fontSize: "13px",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function secondaryActionStyle(
  background,
  color,
  border,
  disabled,
) {
  return {
    border: `1px solid ${border}`,

    background,

    color,

    padding: "11px 16px",

    borderRadius: "9px",

    cursor: disabled
      ? "not-allowed"
      : "pointer",

    fontWeight: "700",

    opacity: disabled
      ? 0.6
      : 1,
  };
}

const cardStyle = {
  background: "#ffffff",

  padding: "26px",

  borderRadius: "16px",

  boxShadow:
    "0 5px 20px rgba(15, 23, 42, 0.08)",

  marginBottom: "22px",
};

const backButtonStyle = {
  border: "none",

  background: "transparent",

  color: "#2563eb",

  padding: 0,

  marginBottom: "18px",

  cursor: "pointer",

  fontWeight: "700",

  fontSize: "15px",
};