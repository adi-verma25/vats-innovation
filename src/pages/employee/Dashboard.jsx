import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../../firebase/firebase";

export default function Dashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
        navigate("/employee-login");
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

        const workOrderList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        workOrderList.sort((firstWorkOrder, secondWorkOrder) => {
          const firstTime =
            firstWorkOrder.createdAt?.seconds ||
            firstWorkOrder.createdAt?.toMillis?.() ||
            0;

          const secondTime =
            secondWorkOrder.createdAt?.seconds ||
            secondWorkOrder.createdAt?.toMillis?.() ||
            0;

          return secondTime - firstTime;
        });

        setWorkOrders(workOrderList);
      } catch (fetchError) {
        console.error(
          "Error loading employee dashboard work orders:",
          fetchError
        );

        setError(
          "Unable to load dashboard information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedWorkOrders();
  }, [currentUser]);

  const dashboardCounts = useMemo(() => {
    const totalAssigned = workOrders.length;

    const pending = workOrders.filter(
      (workOrder) =>
        String(workOrder.status || "")
          .trim()
          .toLowerCase() === "pending"
    ).length;

    const inProgress = workOrders.filter(
      (workOrder) =>
        String(workOrder.status || "")
          .trim()
          .toLowerCase() === "in progress"
    ).length;

    const completed = workOrders.filter(
      (workOrder) =>
        String(workOrder.status || "")
          .trim()
          .toLowerCase() === "completed"
    ).length;

    return {
      totalAssigned,
      pending,
      inProgress,
      completed,
    };
  }, [workOrders]);

  const recentWorkOrders = useMemo(() => {
    return workOrders.slice(0, 3);
  }, [workOrders]);

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

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

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

    return {
      background: "#e5e7eb",
      color: "#374151",
    };
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>

        <p style={styles.loadingText}>
          Loading employee dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.smallTitle}>EMPLOYEE PORTAL</p>

          <h1 style={styles.title}>Employee Dashboard</h1>

          <p style={styles.subtitle}>
            Welcome back. Here is a summary of your assigned work.
          </p>
        </div>

        <Link
          to="/employee/work-orders"
          style={styles.headerButton}
        >
          View My Work Orders
        </Link>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Dashboard error</strong>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      <div style={styles.cardGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.cardIcon}>📋</div>

          <div>
            <p style={styles.cardLabel}>Total Assigned</p>
            <h2 style={styles.cardValue}>
              {dashboardCounts.totalAssigned}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardIcon}>🟡</div>

          <div>
            <p style={styles.cardLabel}>Pending</p>
            <h2 style={styles.cardValue}>
              {dashboardCounts.pending}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardIcon}>🔵</div>

          <div>
            <p style={styles.cardLabel}>In Progress</p>
            <h2 style={styles.cardValue}>
              {dashboardCounts.inProgress}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardIcon}>🟢</div>

          <div>
            <p style={styles.cardLabel}>Completed</p>
            <h2 style={styles.cardValue}>
              {dashboardCounts.completed}
            </h2>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Recent Work Orders
            </h2>

            <p style={styles.sectionSubtitle}>
              Your latest assigned work orders.
            </p>
          </div>

          <Link
            to="/employee/work-orders"
            style={styles.viewAllLink}
          >
            View all
          </Link>
        </div>

        {recentWorkOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>

            <h3 style={styles.emptyTitle}>
              No work orders assigned
            </h3>

            <p style={styles.emptyText}>
              Your assigned work orders will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.workOrderList}>
            {recentWorkOrders.map((workOrder) => {
              const progress = Math.min(
                Math.max(Number(workOrder.progress) || 0, 0),
                100
              );

              return (
                <div
                  key={workOrder.id}
                  style={styles.workOrderCard}
                >
                  <div style={styles.workOrderTop}>
                    <div>
                      <p style={styles.workOrderLabel}>
                        WORK ORDER
                      </p>

                      <h3 style={styles.workOrderNumber}>
                        {workOrder.workOrderNumber ||
                          "Not available"}
                      </h3>
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

                  <h4 style={styles.projectName}>
                    {workOrder.projectName ||
                      "Untitled Project"}
                  </h4>

                  <p style={styles.hospitalName}>
                    {workOrder.hospitalName ||
                      "Hospital not provided"}
                  </p>

                  <div style={styles.detailsRow}>
                    <span>
                      District:{" "}
                      <strong>
                        {workOrder.districtName ||
                          "Not available"}
                      </strong>
                    </span>

                    <span>
                      End Date:{" "}
                      <strong>
                        {formatDate(workOrder.endDate)}
                      </strong>
                    </span>
                  </div>

                  <div style={styles.progressSection}>
                    <div style={styles.progressHeader}>
                      <span>Progress</span>
                      <strong>{progress}%</strong>
                    </div>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${progress}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    padding: "10px",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
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
    color: "#0f172a",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  headerButton: {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
  },

  errorBox: {
    marginBottom: "22px",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
  },

  errorText: {
    margin: "5px 0 0",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
  },

  cardIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "#f1f5f9",
    fontSize: "24px",
  },

  cardLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
  },

  cardValue: {
    margin: "5px 0 0",
    fontSize: "28px",
    color: "#0f172a",
  },

  section: {
    marginTop: "28px",
    padding: "24px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#0f172a",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  viewAllLink: {
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none",
  },

  workOrderList: {
    display: "grid",
    gap: "16px",
  },

  workOrderCard: {
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },

  workOrderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
  },

  workOrderLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#94a3b8",
  },

  workOrderNumber: {
    margin: "5px 0 0",
    color: "#0f172a",
    fontSize: "19px",
  },

  statusBadge: {
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
  },

  projectName: {
    margin: "18px 0 0",
    fontSize: "17px",
    color: "#1e293b",
  },

  hospitalName: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  detailsRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "16px",
    color: "#64748b",
    fontSize: "13px",
  },

  progressSection: {
    marginTop: "18px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    color: "#475569",
    fontSize: "13px",
  },

  progressTrack: {
    height: "9px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
    transition: "width 0.3s ease",
  },

  emptyState: {
    padding: "45px 20px",
    textAlign: "center",
    borderRadius: "14px",
    background: "#f8fafc",
  },

  emptyIcon: {
    fontSize: "40px",
  },

  emptyTitle: {
    margin: "12px 0 6px",
    color: "#0f172a",
  },

  emptyText: {
    margin: 0,
    color: "#64748b",
  },

  loadingContainer: {
    minHeight: "65vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: "14px",
    color: "#64748b",
  },
};