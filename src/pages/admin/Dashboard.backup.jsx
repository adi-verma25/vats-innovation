import { useNavigate } from "react-router-dom";

function ProjectDashboard() {
  const navigate = useNavigate();

  const projectStats = [
    {
      title: "Total States",
      value: "1",
      description: "States currently covered",
      icon: "🗺️",
      className: "blue",
    },
    {
      title: "Total Districts",
      value: "38",
      description: "Districts available in Bihar",
      icon: "🏙️",
      className: "purple",
    },
    {
      title: "Total Work Orders",
      value: "1",
      description: "All project work orders",
      icon: "📋",
      className: "orange",
    },
    {
      title: "Completed Orders",
      value: "0",
      description: "Successfully completed",
      icon: "✅",
      className: "green",
    },
  ];

  const quickActions = [
    {
      title: "Manage States",
      description:
        "View states and access their associated districts and work orders.",
      icon: "🗺️",
      buttonText: "View States",
      onClick: () => navigate("/admin/projects/states"),
    },
    {
      title: "Manage Districts",
      description:
        "Browse districts and manage their project-related information.",
      icon: "🏙️",
      buttonText: "View Districts",
     onClick: () =>
  navigate("/admin/projects/states/bihar/districts"),
    },
    {
      title: "Manage Work Orders",
      description:
        "Create, assign, monitor and update project work orders.",
      icon: "📁",
      buttonText: "View Work Orders",
      onClick: () => navigate("/admin/projects/states"),
    },
  ];

  return (
    <div className="project-dashboard">
      <section className="project-hero">
        <div>
          <p className="project-label">PROJECT MANAGEMENT</p>

          <h1>Projects Dashboard</h1>

          <p className="project-description">
            Manage states, districts and work orders from one central
            workspace.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => navigate("/admin/projects/states")}
        >
          View All Projects
          <span>→</span>
        </button>
      </section>

      <section className="stats-grid">
        {projectStats.map((stat) => (
          <article className="stat-card" key={stat.title}>
            <div className={`stat-icon ${stat.className}`}>{stat.icon}</div>

            <div className="stat-content">
              <p>{stat.title}</p>
              <h2>{stat.value}</h2>
              <span>{stat.description}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Choose an area to manage project operations.</p>
          </div>
        </div>

        <div className="actions-grid">
          {quickActions.map((action) => (
            <article className="action-card" key={action.title}>
              <div className="action-icon">{action.icon}</div>

              <div className="action-card-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>

              <button type="button" onClick={action.onClick}>
                {action.buttonText}
                <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest updates related to project work orders.</p>
          </div>

          <button
            className="text-button"
            type="button"
            onClick={() => navigate("/admin/projects/states")}
          >
            View all
          </button>
        </div>

        <div className="activity-card">
          <div className="activity-icon">📋</div>

          <div className="activity-information">
            <div className="activity-top">
              <div>
                <span className="work-order-label">WORK ORDER</span>
                <h3>WO-0001</h3>
              </div>

              <span className="status-badge">Pending</span>
            </div>

            <div className="activity-details">
              <div>
                <span>Project</span>
                <strong>Sadar</strong>
              </div>

              <div>
                <span>Hospital</span>
                <strong>Sadar Hospital</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>Medicine</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>Vaishali, Bihar</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .project-dashboard {
          min-height: 100%;
          padding: 32px;
          background: #f5f7fb;
          color: #111827;
        }

        .project-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 30px;
          margin-bottom: 26px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background:
            radial-gradient(
              circle at top right,
              rgba(37, 99, 235, 0.16),
              transparent 35%
            ),
            linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.06);
        }

        .project-label {
          margin: 0 0 8px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .project-hero h1 {
          margin: 0;
          font-size: 36px;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .project-description {
          max-width: 580px;
          margin: 10px 0 0;
          color: #64748b;
          font-size: 16px;
          line-height: 1.6;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 180px;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          background: #2563eb;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .primary-button:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 130px;
          padding: 22px;
          border: 1px solid #e6eaf0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.09);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          border-radius: 15px;
          font-size: 25px;
        }

        .stat-icon.blue {
          background: #eaf2ff;
        }

        .stat-icon.purple {
          background: #f1eafe;
        }

        .stat-icon.orange {
          background: #fff4df;
        }

        .stat-icon.green {
          background: #e7f8ed;
        }

        .stat-content p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        .stat-content h2 {
          margin: 5px 0 2px;
          color: #0f172a;
          font-size: 30px;
          line-height: 1;
        }

        .stat-content span {
          color: #94a3b8;
          font-size: 12px;
        }

        .dashboard-section {
          padding: 26px;
          margin-bottom: 26px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0;
          color: #0f172a;
          font-size: 22px;
        }

        .section-heading p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .text-button {
          border: none;
          background: transparent;
          color: #2563eb;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          min-height: 255px;
          padding: 22px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #fbfcfe;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .action-card:hover {
          transform: translateY(-4px);
          border-color: #bfdbfe;
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.09);
        }

        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          margin-bottom: 18px;
          border-radius: 14px;
          background: #eaf2ff;
          font-size: 24px;
        }

        .action-card-content {
          flex: 1;
        }

        .action-card h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 18px;
        }

        .action-card p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .action-card button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 14px;
          margin-top: 20px;
          border: none;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .action-card button:hover {
          background: #2563eb;
          color: #ffffff;
        }

        .activity-card {
          display: flex;
          gap: 18px;
          padding: 22px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #f8fafc;
        }

        .activity-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #eaf2ff;
          font-size: 24px;
        }

        .activity-information {
          width: 100%;
        }

        .activity-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .work-order-label {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .activity-top h3 {
          margin: 5px 0 0;
          color: #0f172a;
          font-size: 20px;
        }

        .status-badge {
          padding: 7px 12px;
          border-radius: 999px;
          background: #fef3c7;
          color: #92400e;
          font-size: 12px;
          font-weight: 700;
        }

        .activity-details {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          padding-top: 20px;
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .activity-details div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .activity-details span {
          color: #94a3b8;
          font-size: 12px;
        }

        .activity-details strong {
          color: #334155;
          font-size: 14px;
        }

        button:focus-visible {
          outline: 3px solid rgba(37, 99, 235, 0.25);
          outline-offset: 2px;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .action-card {
            min-height: auto;
          }

          .activity-details {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .project-dashboard {
            padding: 18px;
          }

          .project-hero {
            align-items: flex-start;
            flex-direction: column;
            padding: 22px;
          }

          .project-hero h1 {
            font-size: 29px;
          }

          .primary-button {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-section {
            padding: 20px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .activity-card {
            flex-direction: column;
          }

          .activity-top {
            align-items: flex-start;
          }

          .activity-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ProjectDashboard;