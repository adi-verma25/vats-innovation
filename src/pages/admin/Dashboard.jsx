import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Employees",
      value: "0",
      description: "Total registered employees",
      icon: "👥",
    },
    {
      title: "Attendance",
      value: "0%",
      description: "Today’s attendance rate",
      icon: "📅",
    },
    {
      title: "Projects",
      value: "1",
      description: "Active company projects",
      icon: "🏗️",
    },
    {
      title: "Work Orders",
      value: "1",
      description: "Total work orders",
      icon: "📋",
    },
  ];

  const quickActions = [
    {
      title: "Manage Employees",
      description: "View, add and manage company employees.",
      icon: "👥",
      path: "/admin/employees",
    },
    {
      title: "View Attendance",
      description: "Monitor employee attendance records.",
      icon: "📅",
      path: "/admin/attendance",
    },
    {
      title: "Manage Projects",
      description: "Manage states, districts and work orders.",
      icon: "🏗️",
      path: "/admin/projects",
    },
    {
     
    },
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.label}>ADMIN WORKSPACE</p>
          <h1 style={styles.heading}>Welcome back, Admin 👋</h1>
          <p style={styles.description}>
            Monitor employees, attendance, projects and company operations
            from one dashboard.
          </p>
        </div>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => navigate("/admin/projects")}
        >
          View Projects →
        </button>
      </section>

      <section style={styles.statsGrid}>
        {stats.map((stat) => (
          <article key={stat.title} style={styles.statCard}>
            <div style={styles.statIcon}>{stat.icon}</div>

            <div>
              <p style={styles.statTitle}>{stat.title}</p>
              <h2 style={styles.statValue}>{stat.value}</h2>
              <span style={styles.statDescription}>{stat.description}</span>
            </div>
          </article>
        ))}
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <p style={styles.sectionDescription}>
              Access frequently used administration tools.
            </p>
          </div>
        </div>

        <div style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <article key={action.title} style={styles.actionCard}>
              <div style={styles.actionIcon}>{action.icon}</div>

              <h3 style={styles.actionTitle}>{action.title}</h3>

              <p style={styles.actionDescription}>{action.description}</p>

              <button
                type="button"
                style={styles.actionButton}
                onClick={() => navigate(action.path)}
              >
                Open
                <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    padding: "32px",
    background: "#f5f7fb",
    color: "#0f172a",
  },

  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    padding: "30px",
    marginBottom: "26px",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    background: "#ffffff",
    boxShadow: "0 12px 35px rgba(15, 23, 42, 0.06)",
  },

  label: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  heading: {
    margin: "0",
    fontSize: "36px",
  },

  description: {
    maxWidth: "620px",
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: "1.6",
  },

  primaryButton: {
    padding: "14px 20px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
  },

  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "54px",
    height: "54px",
    borderRadius: "15px",
    background: "#eff6ff",
    fontSize: "25px",
  },

  statTitle: {
    margin: "0",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "700",
  },

  statValue: {
    margin: "5px 0 2px",
    fontSize: "30px",
  },

  statDescription: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  section: {
    padding: "26px",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },

  sectionHeader: {
    marginBottom: "22px",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "22px",
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  actionCard: {
    display: "flex",
    flexDirection: "column",
    padding: "22px",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#f8fafc",
  },

  actionIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "50px",
    height: "50px",
    marginBottom: "18px",
    borderRadius: "14px",
    background: "#eaf2ff",
    fontSize: "24px",
  },

  actionTitle: {
    margin: "0 0 10px",
    fontSize: "18px",
  },

  actionDescription: {
    flex: "1",
    margin: "0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "12px 14px",
    marginTop: "20px",
    border: "none",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default AdminDashboard;