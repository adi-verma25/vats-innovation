import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getWorkOrderById } from "../../../services/workOrderService";

export default function ViewWorkOrder() {
  const navigate = useNavigate();

  const { stateId, districtId, workOrderId } = useParams();

  const [workOrder, setWorkOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const formatSlug = (value = "") => {
    return String(value)
      .split("-")
      .filter(Boolean)
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  const stateName = formatSlug(
    workOrder?.stateName || stateId
  );

  const districtName = formatSlug(
    workOrder?.districtName || districtId
  );

  const workOrdersPath =
    `/admin/projects/states/${stateId}` +
    `/districts/${districtId}`;

  const editWorkOrderPath =
    `/admin/projects/states/${stateId}` +
    `/districts/${districtId}` +
    `/work-orders/${workOrderId}/edit`;

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!workOrderId) {
        setError("Work order ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const record = await getWorkOrderById(workOrderId);

        if (!record) {
          setError(
            "The requested work order was not found."
          );
          setWorkOrder(null);
          return;
        }

        setWorkOrder(record);
      } catch (loadError) {
        console.error(
          "Unable to load work order:",
          loadError
        );

        setError(
          loadError?.message ||
            "Unable to load the work order. Please try again."
        );

        setWorkOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkOrder();
  }, [workOrderId]);

  const assignedEmployees = useMemo(() => {
    if (
      Array.isArray(workOrder?.assignedEmployees) &&
      workOrder.assignedEmployees.length > 0
    ) {
      return workOrder.assignedEmployees
        .filter(Boolean)
        .map((employee, index) => ({
          id:
            employee.id ||
            employee.employeeId ||
            employee.uid ||
            `employee-${index}`,

          name:
            employee.name ||
            employee.fullName ||
            employee.displayName ||
            employee.email ||
            "Unnamed Employee",

          employeeId:
            employee.employeeId ||
            employee.employeeCode ||
            employee.id ||
            employee.uid ||
            "Not available",

          email:
            employee.email ||
            "Not available",

          department:
            employee.department ||
            "Not assigned",

          designation:
            employee.designation ||
            employee.position ||
            "Employee",
        }));
    }

    if (
      Array.isArray(workOrder?.assignedEmployeeIds)
    ) {
      return workOrder.assignedEmployeeIds.map(
        (employeeId) => ({
          id: employeeId,
          name: "Employee",
          employeeId,
          email: "Not available",
          department: "Not available",
          designation: "Employee",
        })
      );
    }

    return [];
  }, [workOrder]);
    const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    if (
      typeof dateValue === "object" &&
      typeof dateValue.toDate === "function"
    ) {
      return dateValue.toDate().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    const dateString = String(dateValue);

    const date = dateString.includes("T")
      ? new Date(dateString)
      : new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "Not available";
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
      date = new Date(dateValue);
    }

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return {
          background: "#dcfce7",
          color: "#15803d",
          border: "1px solid #86efac",
        };

      case "In Progress":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #93c5fd",
        };

      case "On Hold":
        return {
          background: "#f3e8ff",
          color: "#7e22ce",
          border: "1px solid #d8b4fe",
        };

      case "Cancelled":
        return {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        };

      default:
        return {
          background: "#fef3c7",
          color: "#b45309",
          border: "1px solid #fcd34d",
        };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Urgent":
        return {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        };

      case "High":
        return {
          background: "#ffedd5",
          color: "#c2410c",
          border: "1px solid #fdba74",
        };

      case "Low":
        return {
          background: "#f1f5f9",
          color: "#475569",
          border: "1px solid #cbd5e1",
        };

      default:
        return {
          background: "#e0e7ff",
          color: "#4338ca",
          border: "1px solid #a5b4fc",
        };
    }
  };

  const progress = Math.min(
    100,
    Math.max(0, Number(workOrder?.progress) || 0)
  );

  const latestRemark =
    workOrder?.remarks ||
    workOrder?.latestRemark ||
    workOrder?.progressRemark ||
    workOrder?.progressRemarks ||
    "No progress remarks have been added yet.";

  const lastUpdated =
    workOrder?.progressUpdatedAt ||
    workOrder?.updatedAt ||
    workOrder?.lastUpdated ||
    null;

  const beforePhotos = Array.isArray(workOrder?.beforePhotos)
    ? workOrder.beforePhotos.filter(Boolean)
    : [];

  const afterPhotos = Array.isArray(workOrder?.afterPhotos)
    ? workOrder.afterPhotos.filter(Boolean)
    : [];

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
            fontSize: "44px",
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
          Please wait while the work-order details are loaded.
        </p>
      </div>
    );
  }
    if (error || !workOrder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate(workOrdersPath)}
          style={backButtonStyle}
        >
          ← Back to Work Orders
        </button>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "55px 25px",
            textAlign: "center",
            boxShadow:
              "0 5px 20px rgba(15,23,42,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "14px",
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
            Work Order Unavailable
          </h2>

          <p
            style={{
              margin: "12px auto 22px",
              color: "#64748b",
              maxWidth: "550px",
              lineHeight: "1.6",
            }}
          >
            {error ||
              "Unable to load work order."}
          </p>

          <button
            type="button"
            onClick={() => navigate(workOrdersPath)}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "8px",
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
        onClick={() => navigate(workOrdersPath)}
        style={backButtonStyle}
      >
        ← Back to {districtName} Work Orders
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div>

          <p
            style={{
              margin: "0 0 6px",
              color: "#2563eb",
              fontWeight: "800",
            }}
          >
            {workOrder.workOrderNumber}
          </p>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            {workOrder.projectName}
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            {districtName}, {stateName}
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <button
            type="button"
            onClick={() => navigate(workOrdersPath)}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              padding: "12px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Work Order List
          </button>

          <button
            type="button"
            onClick={() => navigate(editWorkOrderPath)}
            style={{
              border: "none",
              background: "#f59e0b",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            ✏️ Edit Work Order
          </button>

        </div>

      </div>
            <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <span
          style={{
            ...getStatusStyle(workOrder.status),
            padding: "8px 13px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          Status: {workOrder.status || "Pending"}
        </span>

        <span
          style={{
            ...getPriorityStyle(workOrder.priority),
            padding: "8px 13px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          Priority: {workOrder.priority || "Medium"}
        </span>

        <span
          style={{
            background: "#ecfeff",
            color: "#0e7490",
            border: "1px solid #a5f3fc",
            padding: "8px 13px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          Employees: {assignedEmployees.length}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "22px",
        }}
      >
        <InfoCard title="Project Information" icon="📋">
          <DetailItem
            label="Work Order Number"
            value={workOrder.workOrderNumber}
          />

          <DetailItem
            label="Project Name"
            value={workOrder.projectName}
          />

          <DetailItem
            label="Hospital Name"
            value={workOrder.hospitalName}
          />

          <DetailItem
            label="Department"
            value={workOrder.department}
          />

          <DetailItem
            label="Work Type"
            value={workOrder.workType}
          />
        </InfoCard>

        <InfoCard title="Location Information" icon="📍">
          <DetailItem
            label="State"
            value={stateName}
          />

          <DetailItem
            label="State ID"
            value={workOrder.stateId || stateId}
          />

          <DetailItem
            label="District"
            value={districtName}
          />

          <DetailItem
            label="District ID"
            value={workOrder.districtId || districtId}
          />
        </InfoCard>

        <InfoCard title="Schedule Information" icon="📅">
          <DetailItem
            label="Start Date"
            value={formatDate(workOrder.startDate)}
          />

          <DetailItem
            label="End Date"
            value={formatDate(workOrder.endDate)}
          />

          <DetailItem
            label="Created At"
            value={formatDateTime(workOrder.createdAt)}
          />

          <DetailItem
            label="Last Updated"
            value={formatDateTime(lastUpdated)}
          />
        </InfoCard>

        <InfoCard title="Employee Progress" icon="📈">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                color: "#475569",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              Work Completion
            </span>

            <span
              style={{
                color:
                  progress === 100
                    ? "#15803d"
                    : "#2563eb",
                fontSize: "19px",
                fontWeight: "900",
              }}
            >
              {progress}%
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "15px",
              background: "#e2e8f0",
              borderRadius: "20px",
              overflow: "hidden",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background:
                  progress === 100
                    ? "linear-gradient(90deg, #16a34a, #22c55e)"
                    : "linear-gradient(90deg, #2563eb, #06b6d4)",
                borderRadius: "20px",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          <DetailItem
            label="Current Status"
            value={workOrder.status || "Pending"}
          />

          <DetailItem
            label="Remaining Work"
            value={`${Math.max(0, 100 - progress)}%`}
          />

          <DetailItem
            label="Last Updated"
            value={formatDateTime(lastUpdated)}
          />
        </InfoCard>
      </div>

      <InfoCard title="Latest Employee Remarks" icon="💬">
        <div
          style={{
            padding: "18px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#334155",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {latestRemark}
          </p>
        </div>
      </InfoCard>

      <div style={{ marginTop: "22px" }}>
        <InfoCard title="Work Description" icon="📝">
          <p
            style={{
              margin: 0,
              color: "#475569",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {workOrder.description?.trim() ||
              workOrder.workDescription?.trim() ||
              "No description has been added to this work order."}
          </p>
        </InfoCard>
      </div>

      <div style={{ marginTop: "22px" }}>
        <InfoCard title="Work Progress Photos" icon="📷">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "22px",
            }}
          >
            <PhotoGallery
              title="Before Work Photos"
              icon="🔴"
              photos={beforePhotos}
              emptyMessage="The employee has not uploaded any before-work photos."
            />

            <PhotoGallery
              title="After Work Photos"
              icon="🟢"
              photos={afterPhotos}
              emptyMessage="The employee has not uploaded any after-work photos."
            />
          </div>
        </InfoCard>
      </div>
            <div style={{ marginTop: "22px" }}>
        <InfoCard title="Assigned Employees" icon="👷">
          {assignedEmployees.length === 0 ? (
            <div
              style={{
                padding: "30px 20px",
                textAlign: "center",
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "10px",
                }}
              >
                👥
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#334155",
                }}
              >
                No Employee Assigned
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                }}
              >
                No employee is currently assigned to this work order.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {assignedEmployees.map((employee, index) => {
                const employeeName =
                  employee?.name ||
                  employee?.employeeName ||
                  employee?.fullName ||
                  `Employee ${index + 1}`;

                const employeeEmail =
                  employee?.email ||
                  employee?.employeeEmail ||
                  "Email not available";

                const employeePhone =
                  employee?.phone ||
                  employee?.phoneNumber ||
                  employee?.mobile ||
                  employee?.mobileNumber ||
                  "Phone not available";

                const employeeRole =
                  employee?.designation ||
                  employee?.role ||
                  employee?.employeeRole ||
                  "Employee";

                const employeeId =
                  employee?.id ||
                  employee?.employeeId ||
                  employee?.uid ||
                  index;

                return (
                  <div
                    key={employeeId}
                    style={{
                      padding: "18px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      background: "#ffffff",
                      boxShadow:
                        "0 3px 12px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "13px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #2563eb, #06b6d4)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "19px",
                          fontWeight: "900",
                          flexShrink: 0,
                        }}
                      >
                        {employeeName
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <h3
                          style={{
                            margin: "0 0 4px",
                            color: "#0f172a",
                            fontSize: "16px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employeeName}
                        </h3>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 9px",
                            borderRadius: "20px",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: "800",
                          }}
                        >
                          {employeeRole}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 3px",
                            color: "#94a3b8",
                            fontSize: "12px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                          }}
                        >
                          Email
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#475569",
                            fontSize: "14px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employeeEmail}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            margin: "0 0 3px",
                            color: "#94a3b8",
                            fontSize: "12px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                          }}
                        >
                          Phone
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#475569",
                            fontSize: "14px",
                          }}
                        >
                          {employeePhone}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </InfoCard>
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          color: "#1e40af",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <strong>Admin Note:</strong> Progress, remarks and work photos shown
        above are submitted by the assigned employee.
      </div>
    </div>
  );
}
function InfoCard({ title, icon, children }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
          paddingBottom: "13px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <span
          style={{
            fontSize: "22px",
          }}
        >
          {icon}
        </span>

        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "18px",
          }}
        >
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function DetailItem({ label, value }) {
  const displayValue =
    value === undefined ||
    value === null ||
    value === ""
      ? "Not available"
      : value;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(125px, 0.45fr) 1fr",
        gap: "12px",
        padding: "11px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: "13px",
          fontWeight: "700",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#1e293b",
          fontSize: "14px",
          fontWeight: "600",
          overflowWrap: "anywhere",
          textAlign: "right",
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}

function PhotoGallery({
  title,
  icon,
  photos,
  emptyMessage,
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "17px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <span>{icon}</span>

        <h3
          style={{
            margin: 0,
            color: "#1e293b",
            fontSize: "16px",
          }}
        >
          {title}
        </h3>

        <span
          style={{
            marginLeft: "auto",
            padding: "4px 9px",
            borderRadius: "20px",
            background: "#e2e8f0",
            color: "#475569",
            fontSize: "12px",
            fontWeight: "800",
          }}
        >
          {photos.length}
        </span>
      </div>

      {photos.length === 0 ? (
        <div
          style={{
            padding: "32px 15px",
            textAlign: "center",
            background: "#ffffff",
            border: "1px dashed #cbd5e1",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "34px",
              marginBottom: "9px",
            }}
          >
            🖼️
          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {photos.map((photo, index) => {
            const photoUrl =
              typeof photo === "string"
                ? photo
                : photo?.url ||
                  photo?.downloadURL ||
                  photo?.imageUrl ||
                  "";

            if (!photoUrl) {
              return null;
            }

            return (
              <a
                key={`${photoUrl}-${index}`}
                href={photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  position: "relative",
                  height: "145px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #cbd5e1",
                  background: "#e2e8f0",
                  textDecoration: "none",
                }}
                title={`Open ${title} ${index + 1}`}
              >
                <img
                  src={photoUrl}
                  alt={`${title} ${index + 1}`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    right: "7px",
                    bottom: "7px",
                    padding: "4px 7px",
                    borderRadius: "7px",
                    background: "rgba(15, 23, 42, 0.75)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  View
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  padding: "0",
  marginBottom: "20px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "800",
};
