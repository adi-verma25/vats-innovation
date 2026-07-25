import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

function ViewWorkOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workOrderId } = useParams();

  const workOrder = location.state?.workOrder;

  if (!workOrder) {
    return (
      <div style={styles.notFoundContainer}>
        <h2 style={styles.notFoundTitle}>
          Work Order Not Found
        </h2>

        <p style={styles.notFoundText}>
          This work order information is unavailable.
          Please return to your work-order list and open
          it again.
        </p>

        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            navigate("/employee/work-orders")
          }
        >
          Back to My Work Orders
        </button>
      </div>
    );
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not Available";
    }

    try {
      if (dateValue?.toDate) {
        return dateValue
          .toDate()
          .toLocaleDateString("en-IN");
      }

      return new Date(dateValue).toLocaleDateString(
        "en-IN"
      );
    } catch {
      return "Not Available";
    }
  };

  const progress = Math.min(
    Math.max(Number(workOrder.progress) || 0, 0),
    100
  );

  const beforePhotos = Array.isArray(
    workOrder.beforePhotos
  )
    ? workOrder.beforePhotos
    : [];

  const afterPhotos = Array.isArray(
    workOrder.afterPhotos
  )
    ? workOrder.afterPhotos
    : [];

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "completed") {
      return {
        background: "#DCFCE7",
        color: "#166534",
      };
    }

    if (value === "pending") {
      return {
        background: "#FEF3C7",
        color: "#92400E",
      };
    }

    if (value === "in progress") {
      return {
        background: "#DBEAFE",
        color: "#1D4ED8",
      };
    }

    if (value === "on hold") {
      return {
        background: "#FEE2E2",
        color: "#B91C1C",
      };
    }

    return {
      background: "#E5E7EB",
      color: "#374151",
    };
  };

  const getPriorityStyle = (priority) => {
    const value = String(
      priority || ""
    ).toLowerCase();

    if (value === "high") {
      return {
        background: "#FEE2E2",
        color: "#B91C1C",
      };
    }

    if (value === "medium") {
      return {
        background: "#FEF3C7",
        color: "#92400E",
      };
    }

    return {
      background: "#DCFCE7",
      color: "#166534",
    };
  };

  const handleUpdateProgress = () => {
    const id = workOrderId || workOrder.id;

    if (!id) {
      window.alert(
        "Work order ID is unavailable. Please reopen this work order from My Work Orders."
      );
      return;
    }

    navigate(
      `/employee/work-orders/${id}/update-progress`,
      {
        state: {
          workOrder: {
            ...workOrder,
            id,
          },
        },
      }
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            navigate("/employee/work-orders")
          }
        >
          ← Back
        </button>

        <div style={styles.headerTitleArea}>
          <p style={styles.portalLabel}>
            EMPLOYEE PORTAL
          </p>

          <h1 style={styles.title}>
            Work Order Details
          </h1>

          <p style={styles.subtitle}>
            Complete information about your assigned
            work order.
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.topRow}>
          <div>
            <p style={styles.label}>
              WORK ORDER NUMBER
            </p>

            <h2 style={styles.number}>
              {workOrder.workOrderNumber ||
                "Not available"}
            </h2>
          </div>

          <span
            style={{
              ...styles.status,
              ...getStatusStyle(workOrder.status),
            }}
          >
            {workOrder.status || "Pending"}
          </span>
        </div>

        <div style={styles.grid}>
          <div style={styles.item}>
            <span style={styles.itemLabel}>
              Project
            </span>

            <strong>
              {workOrder.projectName ||
                "Not available"}
            </strong>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              Hospital
            </span>

            <strong>
              {workOrder.hospitalName ||
                "Not available"}
            </strong>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              State
            </span>

            <strong>
              {workOrder.stateName ||
                "Not available"}
            </strong>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              District
            </span>

            <strong>
              {workOrder.districtName ||
                "Not available"}
            </strong>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              Start Date
            </span>

            <strong>
              {formatDate(workOrder.startDate)}
            </strong>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              End Date
            </span>

            <strong>
              {formatDate(workOrder.endDate)}
            </strong>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              Priority
            </span>

            <span
              style={{
                ...styles.priorityBadge,
                ...getPriorityStyle(
                  workOrder.priority
                ),
              }}
            >
              {workOrder.priority || "Normal"}
            </span>
          </div>

          <div style={styles.item}>
            <span style={styles.itemLabel}>
              Current Status
            </span>

            <strong>
              {workOrder.status || "Pending"}
            </strong>
          </div>
        </div>

        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>
              Work Progress
            </span>

            <strong style={styles.progressValue}>
              {progress}%
            </strong>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Work Description
          </h3>

          <p style={styles.description}>
            {workOrder.description ||
              workOrder.workDescription ||
              "No description has been provided for this work order."}
          </p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Latest Progress Remarks
          </h3>

          <p style={styles.description}>
            {workOrder.remarks ||
              "No progress remarks have been added yet."}
          </p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Additional Information
          </h3>

          <div style={styles.additionalGrid}>
            <div style={styles.additionalItem}>
              <span style={styles.itemLabel}>
                Contact Person
              </span>

              <strong>
                {workOrder.contactPerson ||
                  "Not available"}
              </strong>
            </div>

            <div style={styles.additionalItem}>
              <span style={styles.itemLabel}>
                Contact Number
              </span>

              <strong>
                {workOrder.contactNumber ||
                  "Not available"}
              </strong>
            </div>

            <div style={styles.additionalItem}>
              <span style={styles.itemLabel}>
                Work Type
              </span>

              <strong>
                {workOrder.workType ||
                  "Not available"}
              </strong>
            </div>

            <div style={styles.additionalItem}>
              <span style={styles.itemLabel}>
                Department
              </span>

              <strong>
                {workOrder.department ||
                  "Not available"}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Assigned Employees
          </h3>

          {Array.isArray(
            workOrder.assignedEmployees
          ) &&
          workOrder.assignedEmployees.length > 0 ? (
            <div style={styles.employeeList}>
              {workOrder.assignedEmployees.map(
                (employee, index) => (
                  <div
                    key={
                      employee.uid ||
                      employee.id ||
                      employee.email ||
                      index
                    }
                    style={styles.employeeCard}
                  >
                    <div
                      style={styles.employeeAvatar}
                    >
                      {String(
                        employee.name ||
                          employee.displayName ||
                          employee.email ||
                          "E"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong
                        style={styles.employeeName}
                      >
                        {employee.name ||
                          employee.displayName ||
                          "Employee"}
                      </strong>

                      <p
                        style={styles.employeeEmail}
                      >
                        {employee.email ||
                          "Email not available"}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : Array.isArray(
              workOrder.assignedEmployeeNames
            ) &&
            workOrder.assignedEmployeeNames.length >
              0 ? (
            <div style={styles.employeeList}>
              {workOrder.assignedEmployeeNames.map(
                (employeeName, index) => (
                  <div
                    key={`${employeeName}-${index}`}
                    style={styles.employeeCard}
                  >
                    <div
                      style={styles.employeeAvatar}
                    >
                      {String(employeeName)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong
                        style={styles.employeeName}
                      >
                        {employeeName}
                      </strong>

                      <p
                        style={styles.employeeEmail}
                      >
                        Assigned employee
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={styles.emptyEmployeeBox}>
              <p style={styles.emptyEmployeeText}>
                Employee information is not available.
              </p>
            </div>
          )}
        </div>

        {(beforePhotos.length > 0 ||
          afterPhotos.length > 0) && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Work Photos
            </h3>

            {beforePhotos.length > 0 && (
              <div style={styles.photoSection}>
                <h4 style={styles.photoTitle}>
                  Before Work
                </h4>

                <div style={styles.photoGrid}>
                  {beforePhotos.map(
                    (photoUrl, index) => (
                      <a
                        key={`${photoUrl}-${index}`}
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.photoLink}
                      >
                        <img
                          src={photoUrl}
                          alt={`Before work ${
                            index + 1
                          }`}
                          style={styles.photo}
                        />
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {afterPhotos.length > 0 && (
              <div style={styles.photoSection}>
                <h4 style={styles.photoTitle}>
                  After Work
                </h4>

                <div style={styles.photoGrid}>
                  {afterPhotos.map(
                    (photoUrl, index) => (
                      <a
                        key={`${photoUrl}-${index}`}
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.photoLink}
                      >
                        <img
                          src={photoUrl}
                          alt={`After work ${index + 1}`}
                          style={styles.photo}
                        />
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <button
            type="button"
            style={styles.footerBackButton}
            onClick={() =>
              navigate("/employee/work-orders")
            }
          >
            Back to My Work Orders
          </button>

          <button
            type="button"
            style={styles.updateButton}
            onClick={handleUpdateProgress}
          >
            Update Progress
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f5f7fb",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    marginBottom: "25px",
  },

  headerTitleArea: {
    marginTop: "20px",
  },

  portalLabel: {
    margin: "0 0 6px",
    color: "#2563EB",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.4px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "32px",
    color: "#111827",
  },

  subtitle: {
    margin: 0,
    color: "#6B7280",
    fontSize: "15px",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "18px",
    padding: "30px",
    boxShadow:
      "0 8px 25px rgba(0, 0, 0, 0.06)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "20px",
  },

  label: {
    margin: "0 0 6px",
    color: "#9CA3AF",
    fontSize: "12px",
    fontWeight: "700",
  },

  number: {
    margin: 0,
    color: "#111827",
  },

  status: {
    padding: "8px 15px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
  },

  priorityBadge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  item: {
    padding: "16px",
    borderRadius: "12px",
    background: "#F9FAFB",
  },

  itemLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#6B7280",
    fontSize: "12px",
    fontWeight: "700",
  },

  progressSection: {
    marginTop: "35px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  progressLabel: {
    fontWeight: "700",
  },

  progressValue: {
    color: "#2563EB",
  },

  progressTrack: {
    height: "10px",
    borderRadius: "999px",
    background: "#E5E7EB",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #2563EB, #06B6D4)",
    transition: "width 0.3s ease",
  },

  section: {
    marginTop: "35px",
  },

  sectionTitle: {
    marginBottom: "15px",
    color: "#111827",
  },

  description: {
    margin: 0,
    padding: "18px",
    borderRadius: "12px",
    background: "#F9FAFB",
    lineHeight: 1.7,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },

  additionalGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  additionalItem: {
    padding: "16px",
    borderRadius: "10px",
    background: "#F9FAFB",
  },

  employeeList: {
    display: "grid",
    gap: "15px",
  },

  employeeCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    borderRadius: "12px",
    background: "#F9FAFB",
  },

  employeeAvatar: {
    width: "48px",
    height: "48px",
    flexShrink: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    background: "#2563EB",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: "18px",
  },

  employeeName: {
    display: "block",
    color: "#111827",
  },

  employeeEmail: {
    margin: "4px 0 0",
    color: "#6B7280",
    fontSize: "13px",
  },

  emptyEmployeeBox: {
    padding: "20px",
    borderRadius: "10px",
    background: "#F9FAFB",
    textAlign: "center",
  },

  emptyEmployeeText: {
    margin: 0,
    color: "#6B7280",
  },

  photoSection: {
    marginTop: "20px",
  },

  photoTitle: {
    margin: "0 0 12px",
    color: "#374151",
  },

  photoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "15px",
  },

  photoLink: {
    display: "block",
    padding: "8px",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    background: "#F9FAFB",
  },

  photo: {
    display: "block",
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  footer: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "12px",
  },

  footerBackButton: {
    padding: "12px 24px",
    border: "1px solid #D1D5DB",
    borderRadius: "10px",
    background: "#FFFFFF",
    color: "#374151",
    fontWeight: "700",
    cursor: "pointer",
  },

  updateButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    background: "#2563EB",
    color: "#FFFFFF",
    fontWeight: "700",
    cursor: "pointer",
  },

  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "700",
  },

  notFoundContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    padding: "30px",
    background: "#F5F7FB",
    textAlign: "center",
  },

  notFoundTitle: {
    margin: 0,
    color: "#111827",
  },

  notFoundText: {
    maxWidth: "480px",
    margin: 0,
    color: "#6B7280",
    lineHeight: 1.6,
  },
};

export default ViewWorkOrder;