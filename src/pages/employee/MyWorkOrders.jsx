import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../../firebase/firebase";

function MyWorkOrders() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchAssignedWorkOrders = async () => {
      if (!currentUser?.uid) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const workOrdersRef = collection(db, "workOrders");

        const assignedWorkOrdersQuery = query(
          workOrdersRef,
          where(
            "assignedEmployeeIds",
            "array-contains",
            currentUser.uid
          )
        );

        const snapshot = await getDocs(assignedWorkOrdersQuery);

        const workOrderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        workOrderList.sort((a, b) => {
          const aTime =
            a.createdAt?.seconds ||
            a.createdAt?.toMillis?.() ||
            0;

          const bTime =
            b.createdAt?.seconds ||
            b.createdAt?.toMillis?.() ||
            0;

          return bTime - aTime;
        });

        setWorkOrders(workOrderList);
      } catch (fetchError) {
        console.error(
          "Error loading assigned work orders:",
          fetchError
        );

        setError(
          "Unable to load your assigned work orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedWorkOrders();
  }, [currentUser]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((workOrder) => {
      const searchValue = searchText.trim().toLowerCase();

      const searchableText = [
        workOrder.workOrderNumber,
        workOrder.projectName,
        workOrder.hospitalName,
        workOrder.districtName,
        workOrder.stateName,
        workOrder.status,
        workOrder.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const normalizedStatus = String(
        workOrder.status || ""
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchText, statusFilter]);

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "completed") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (normalizedStatus === "in progress") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (normalizedStatus === "pending") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (normalizedStatus === "cancelled") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      background: "#e5e7eb",
      color: "#374151",
    };
  };

  const getPriorityStyle = (priority) => {
    const normalizedPriority = String(
      priority || ""
    ).toLowerCase();

    if (normalizedPriority === "high") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (normalizedPriority === "medium") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (normalizedPriority === "low") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#e5e7eb",
      color: "#374151",
    };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    try {
      if (dateValue?.toDate) {
        return dateValue.toDate().toLocaleDateString("en-IN");
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "Not available";
      }

      return date.toLocaleDateString("en-IN");
    } catch {
      return "Not available";
    }
  };

  const handleViewWorkOrder = (workOrder) => {
    navigate(
      `/employee/work-orders/${workOrder.id}`,
      {
        state: {
          workOrder,
        },
      }
    );
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>
          Loading your assigned work orders...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.smallTitle}>EMPLOYEE PORTAL</p>

          <h1 style={styles.title}>My Work Orders</h1>

          <p style={styles.subtitle}>
            View all work orders assigned specifically to you.
          </p>
        </div>

        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total Assigned</span>

          <strong style={styles.totalValue}>
            {workOrders.length}
          </strong>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.searchContainer}>
          <label style={styles.label}>Search Work Orders</label>

          <input
            type="text"
            placeholder="Search by work order, project, hospital or district"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            style={styles.input}
          />
        </div>

        <div style={styles.statusContainer}>
          <label style={styles.label}>Filter by Status</label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Something went wrong</strong>

          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {!error && filteredWorkOrders.length === 0 && (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>📋</div>

          <h2 style={styles.emptyTitle}>
            No Work Orders Found
          </h2>

          <p style={styles.emptyText}>
            {workOrders.length === 0
              ? "No work order has been assigned to you yet."
              : "No work order matches your current search or filter."}
          </p>
        </div>
      )}

      <div style={styles.workOrderGrid}>
        {filteredWorkOrders.map((workOrder) => {
          const progress = Number(workOrder.progress) || 0;

          return (
            <div key={workOrder.id} style={styles.workOrderCard}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.workOrderLabel}>
                    WORK ORDER
                  </p>

                  <h2 style={styles.workOrderNumber}>
                    {workOrder.workOrderNumber || "Not assigned"}
                  </h2>
                </div>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(workOrder.status),
                  }}
                >
                  {workOrder.status || "Pending"}
                </span>
              </div>

              <div style={styles.cardSection}>
                <h3 style={styles.projectName}>
                  {workOrder.projectName || "Untitled Project"}
                </h3>

                <p style={styles.hospitalName}>
                  {workOrder.hospitalName || "Hospital not provided"}
                </p>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailBox}>
                  <span style={styles.detailLabel}>State</span>

                  <strong style={styles.detailValue}>
                    {workOrder.stateName || "Not available"}
                  </strong>
                </div>

                <div style={styles.detailBox}>
                  <span style={styles.detailLabel}>District</span>

                  <strong style={styles.detailValue}>
                    {workOrder.districtName || "Not available"}
                  </strong>
                </div>

                <div style={styles.detailBox}>
                  <span style={styles.detailLabel}>Start Date</span>

                  <strong style={styles.detailValue}>
                    {formatDate(workOrder.startDate)}
                  </strong>
                </div>

                <div style={styles.detailBox}>
                  <span style={styles.detailLabel}>End Date</span>

                  <strong style={styles.detailValue}>
                    {formatDate(workOrder.endDate)}
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
                      width: `${Math.min(
                        Math.max(progress, 0),
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span
                  style={{
                    ...styles.priorityBadge,
                    ...getPriorityStyle(workOrder.priority),
                  }}
                >
                  {workOrder.priority || "Normal"} Priority
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleViewWorkOrder(workOrder)
                  }
                  style={styles.viewButton}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    padding: "30px",
    background: "#f5f7fb",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  smallTitle: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#2563eb",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },

  totalCard: {
    minWidth: "150px",
    padding: "18px 22px",
    borderRadius: "16px",
    background: "#111827",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(17, 24, 39, 0.15)",
  },

  totalLabel: {
    display: "block",
    fontSize: "13px",
    color: "#d1d5db",
  },

  totalValue: {
    display: "block",
    marginTop: "5px",
    fontSize: "30px",
  },

  filterCard: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "18px",
    marginBottom: "24px",
    padding: "20px",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
  },

  searchContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  statusContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    background: "#f9fafb",
  },

  select: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    background: "#f9fafb",
  },

  errorBox: {
    padding: "18px",
    marginBottom: "22px",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    background: "#fef2f2",
    color: "#991b1b",
  },

  errorText: {
    margin: "6px 0 0",
  },

  emptyCard: {
    padding: "50px 24px",
    borderRadius: "18px",
    background: "#ffffff",
    textAlign: "center",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
  },

  emptyIcon: {
    fontSize: "44px",
  },

  emptyTitle: {
    margin: "14px 0 8px",
    color: "#111827",
  },

  emptyText: {
    margin: 0,
    color: "#6b7280",
  },

  workOrderGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },

  workOrderCard: {
    padding: "22px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  workOrderLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#9ca3af",
  },

  workOrderNumber: {
    margin: "5px 0 0",
    fontSize: "20px",
    color: "#111827",
  },

  statusBadge: {
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  cardSection: {
    marginTop: "20px",
    paddingBottom: "18px",
    borderBottom: "1px solid #e5e7eb",
  },

  projectName: {
    margin: 0,
    fontSize: "18px",
    color: "#1f2937",
  },

  hospitalName: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "18px",
  },

  detailBox: {
    padding: "12px",
    borderRadius: "11px",
    background: "#f9fafb",
  },

  detailLabel: {
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    color: "#9ca3af",
  },

  detailValue: {
    fontSize: "13px",
    color: "#374151",
  },

  progressSection: {
    marginTop: "20px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "9px",
  },

  progressLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#4b5563",
  },

  progressValue: {
    fontSize: "13px",
    color: "#2563eb",
  },

  progressTrack: {
    height: "10px",
    borderRadius: "999px",
    background: "#e5e7eb",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
    transition: "width 0.3s ease",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginTop: "22px",
  },

  priorityBadge: {
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "800",
  },

  viewButton: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },

  centerContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
  },

  loader: {
    width: "42px",
    height: "42px",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "15px",
    color: "#6b7280",
  },
};

export default MyWorkOrders;