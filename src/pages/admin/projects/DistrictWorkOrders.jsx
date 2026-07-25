import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  deleteWorkOrder,
  getWorkOrdersByDistrict,
} from "../../../services/workOrderService";

export default function DistrictWorkOrders() {
  const navigate = useNavigate();
  const { stateId, districtId } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workOrders, setWorkOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const formatSlug = (value = "") => {
    return value
      .split("-")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  const stateName = formatSlug(stateId);
  const districtName = formatSlug(districtId);

  const loadWorkOrders = useCallback(async () => {
    if (!stateId || !districtId) {
      setError("State or district information is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const records = await getWorkOrdersByDistrict(
        stateId,
        districtId,
      );

      setWorkOrders(records);
    } catch (loadError) {
      console.error("Unable to load work orders:", loadError);

      const isIndexError =
        loadError?.code === "failed-precondition" ||
        loadError?.message?.toLowerCase().includes("index");

      if (isIndexError) {
        setError(
          "Firestore requires an index for this page. Open the browser console, click the Firebase index link, create the index, and reload this page.",
        );
      } else {
        setError(
          loadError?.message ||
            "Unable to load work orders. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [stateId, districtId]);

  useEffect(() => {
    loadWorkOrders();
  }, [loadWorkOrders]);

  const filteredWorkOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return workOrders.filter((workOrder) => {
      const searchableValues = [
        workOrder.workOrderNumber,
        workOrder.projectName,
        workOrder.hospitalName,
        workOrder.department,
        workOrder.priority,
        workOrder.status,
      ];

      const matchesSearch =
        keyword === "" ||
        searchableValues.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(keyword),
        );

      const matchesStatus =
        statusFilter === "All" ||
        workOrder.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, workOrders]);

  const summary = useMemo(() => {
    return {
      total: workOrders.length,
      pending: workOrders.filter(
        (workOrder) => workOrder.status === "Pending",
      ).length,
      inProgress: workOrders.filter(
        (workOrder) => workOrder.status === "In Progress",
      ).length,
      completed: workOrders.filter(
        (workOrder) => workOrder.status === "Completed",
      ).length,
    };
  }, [workOrders]);

  const handleAddWorkOrder = () => {
    navigate(
      `/admin/projects/states/${stateId}/districts/${districtId}/add`,
    );
  };

  const handleView = (workOrderId) => {
    if (!workOrderId) {
      setError("Unable to open this work order because its ID is missing.");
      return;
    }

    navigate(
      `/admin/projects/states/${stateId}/districts/${districtId}/work-orders/${workOrderId}`,
    );
  };

  const handleEdit = (workOrderId) => {
    if (!workOrderId) {
      setError("Unable to edit this work order because its ID is missing.");
      return;
    }

    navigate(
      `/admin/projects/states/${stateId}/districts/${districtId}/work-orders/${workOrderId}/edit`,
    );
  };

  const handleDelete = async (workOrder) => {
    const workOrderLabel =
      workOrder.workOrderNumber || "this work order";

    const shouldDelete = window.confirm(
      `Are you sure you want to permanently delete ${workOrderLabel}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(workOrder.id);
      setError("");

      await deleteWorkOrder(workOrder.id);

      setWorkOrders((previousWorkOrders) =>
        previousWorkOrders.filter(
          (item) => item.id !== workOrder.id,
        ),
      );
    } catch (deleteError) {
      console.error("Unable to delete work order:", deleteError);

      setError(
        deleteError?.message ||
          "Unable to delete the work order. Please try again.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return {
          background: "#dcfce7",
          color: "#15803d",
        };

      case "In Progress":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
        };

      case "On Hold":
        return {
          background: "#f3e8ff",
          color: "#7e22ce",
        };

      case "Cancelled":
        return {
          background: "#fee2e2",
          color: "#b91c1c",
        };

      default:
        return {
          background: "#fef3c7",
          color: "#b45309",
        };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Urgent":
        return {
          background: "#fee2e2",
          color: "#b91c1c",
        };

      case "High":
        return {
          background: "#ffedd5",
          color: "#c2410c",
        };

      case "Low":
        return {
          background: "#f1f5f9",
          color: "#475569",
        };

      default:
        return {
          background: "#e0e7ff",
          color: "#4338ca",
        };
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const actionButtonStyle = (
    background,
    disabled = false,
  ) => ({
    border: "none",
    background: disabled ? "#94a3b8" : background,
    color: "#ffffff",
    padding: "8px 11px",
    borderRadius: "7px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    fontWeight: "700",
  });

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          navigate(`/admin/projects/states/${stateId}`)
        }
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
          fontWeight: "700",
          padding: 0,
          marginBottom: "18px",
          fontSize: "15px",
        }}
      >
        ← Back to {stateName} districts
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
            📁 {districtName} Work Orders
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#64748b",
            }}
          >
            Manage all project work orders for {districtName},{" "}
            {stateName}.
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
            onClick={loadWorkOrders}
            disabled={isLoading}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              padding: "13px 18px",
              borderRadius: "10px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: "14px",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            onClick={handleAddWorkOrder}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              padding: "13px 19px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow:
                "0 4px 12px rgba(37, 99, 235, 0.25)",
            }}
          >
            + Add Work Order
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#b91c1c",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "22px",
          }}
        >
          <strong>Unable to complete the request</strong>

          <p
            style={{
              margin: "6px 0 0",
            }}
          >
            {error}
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
          marginBottom: "22px",
        }}
      >
        <SummaryCard
          title="Total Work Orders"
          value={summary.total}
          icon="📋"
        />

        <SummaryCard
          title="Pending"
          value={summary.pending}
          icon="⏳"
        />

        <SummaryCard
          title="In Progress"
          value={summary.inProgress}
          icon="🚧"
        />

        <SummaryCard
          title="Completed"
          value={summary.completed}
          icon="✅"
        />
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "18px",
          boxShadow:
            "0 4px 15px rgba(15, 23, 42, 0.07)",
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "14px",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search number, project, hospital or department..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 15px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "15px",
              outline: "none",
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 15px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "15px",
              outline: "none",
              background: "#ffffff",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow:
            "0 4px 15px rgba(15, 23, 42, 0.07)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "1200px",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {[
                "Work Order",
                "Project Name",
                "Hospital",
                "Department",
                "Start Date",
                "End Date",
                "Priority",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    color: "#334155",
                    fontSize: "14px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: "55px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize: "38px",
                      marginBottom: "12px",
                    }}
                  >
                    ⏳
                  </div>

                  <strong>Loading work orders...</strong>
                </td>
              </tr>
            ) : filteredWorkOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: "45px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      marginBottom: "12px",
                    }}
                  >
                    📭
                  </div>

                  <strong>No work orders found.</strong>

                  <p
                    style={{
                      margin: "8px 0 18px",
                    }}
                  >
                    {workOrders.length === 0
                      ? `No work order has been created for ${districtName} yet.`
                      : "Try changing your search or status filter."}
                  </p>

                  {workOrders.length === 0 && (
                    <button
                      type="button"
                      onClick={handleAddWorkOrder}
                      style={{
                        border: "none",
                        background: "#2563eb",
                        color: "#ffffff",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      + Create First Work Order
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredWorkOrders.map((workOrder) => {
                const isDeleting =
                  deletingId === workOrder.id;

                return (
                  <tr key={workOrder.id}>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          color: "#2563eb",
                          fontWeight: "800",
                        }}
                      >
                        {workOrder.workOrderNumber ||
                          "Not assigned"}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          color: "#0f172a",
                          fontWeight: "700",
                        }}
                      >
                        {workOrder.projectName ||
                          "Not available"}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      {workOrder.hospitalName ||
                        "Not available"}
                    </td>

                    <td style={tableCellStyle}>
                      {workOrder.department ||
                        "Not available"}
                    </td>

                    <td style={tableCellStyle}>
                      {formatDate(workOrder.startDate)}
                    </td>

                    <td style={tableCellStyle}>
                      {formatDate(workOrder.endDate)}
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...getPriorityStyle(
                            workOrder.priority,
                          ),
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "800",
                        }}
                      >
                        {workOrder.priority || "Medium"}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...getStatusStyle(
                            workOrder.status,
                          ),
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "800",
                        }}
                      >
                        {workOrder.status || "Pending"}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleView(workOrder.id)
                          }
                          disabled={isDeleting}
                          style={actionButtonStyle(
                            "#2563eb",
                            isDeleting,
                          )}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(workOrder.id)
                          }
                          disabled={isDeleting}
                          style={actionButtonStyle(
                            "#f59e0b",
                            isDeleting,
                          )}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(workOrder)
                          }
                          disabled={isDeleting}
                          style={actionButtonStyle(
                            "#dc2626",
                            isDeleting,
                          )}
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tableCellStyle = {
  padding: "15px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: "14px",
  verticalAlign: "middle",
};

function SummaryCard({ title, value, icon }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "20px",
        boxShadow:
          "0 4px 15px rgba(15, 23, 42, 0.07)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {title}
        </p>

        <h2
          style={{
            margin: "8px 0 0",
            color: "#0f172a",
            fontSize: "28px",
          }}
        >
          {value}
        </h2>
      </div>

      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "13px",
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
        }}
      >
        {icon}
      </div>
    </div>
  );
}