import { useNavigate } from "react-router-dom";

export default function States() {
  const navigate = useNavigate();

  const states = [
    {
      id: "bihar",
      name: "Bihar",
      districts: 38,
      status: "Active",
    },
  ];

  const openState = (stateId) => {
    navigate(`/admin/projects/states/${stateId}`);
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            color: "#0f172a",
          }}
        >
          🗺 States
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
            fontSize: "16px",
          }}
        >
          Select a state to view its districts and work orders.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "22px",
        }}
      >
        {states.map((state) => (
          <button
            key={state.id}
            type="button"
            onClick={() => openState(state.id)}
            style={{
              border: "none",
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 5px 20px rgba(15, 23, 42, 0.08)",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-4px)";
              event.currentTarget.style.boxShadow =
                "0 12px 28px rgba(15, 23, 42, 0.14)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow =
                "0 5px 20px rgba(15, 23, 42, 0.08)";
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "14px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                marginBottom: "18px",
              }}
            >
              🗺
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "25px",
              }}
            >
              {state.name}
            </h2>

            <p
              style={{
                margin: "10px 0 18px",
                color: "#64748b",
              }}
            >
              Manage districts and work orders in {state.name}.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  color: "#334155",
                  fontWeight: "600",
                }}
              >
                {state.districts} Districts
              </span>

              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {state.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}