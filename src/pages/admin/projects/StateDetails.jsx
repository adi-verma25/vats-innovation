import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const biharDistricts = [
  "Araria",
  "Arwal",
  "Aurangabad",
  "Banka",
  "Begusarai",
  "Bhagalpur",
  "Bhojpur",
  "Buxar",
  "Darbhanga",
  "East Champaran",
  "Gaya",
  "Gopalganj",
  "Jamui",
  "Jehanabad",
  "Kaimur",
  "Katihar",
  "Khagaria",
  "Kishanganj",
  "Lakhisarai",
  "Madhepura",
  "Madhubani",
  "Munger",
  "Muzaffarpur",
  "Nalanda",
  "Nawada",
  "Patna",
  "Purnia",
  "Rohtas",
  "Saharsa",
  "Samastipur",
  "Saran",
  "Sheikhpura",
  "Sheohar",
  "Sitamarhi",
  "Siwan",
  "Supaul",
  "Vaishali",
  "West Champaran",
];

export default function StateDetails() {
  const { stateId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const stateName =
    stateId === "bihar"
      ? "Bihar"
      : stateId
          ?.split("-")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(" ");

  const filteredDistricts = useMemo(() => {
    return biharDistricts.filter((district) =>
      district.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

 const openDistrict = (districtName) => {
  const districtSlug = districtName
    .toLowerCase()
    .replace(/\s+/g, "-");

  navigate(
    `/admin/projects/states/${stateId}/districts/${districtSlug}`,
  );
};

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/admin/projects/states")}
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
          fontWeight: "600",
          padding: 0,
          marginBottom: "18px",
          fontSize: "15px",
        }}
      >
        ← Back to States
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "26px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "32px",
            }}
          >
            🗺 {stateName}
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            Select a district to manage its work orders.
          </p>
        </div>

        <div
          style={{
            background: "#dbeafe",
            color: "#1d4ed8",
            padding: "10px 16px",
            borderRadius: "24px",
            fontWeight: "700",
          }}
        >
          {filteredDistricts.length} Districts
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          padding: "18px",
          borderRadius: "14px",
          boxShadow: "0 4px 15px rgba(15, 23, 42, 0.07)",
          marginBottom: "24px",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search district..."
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
      </div>

      {filteredDistricts.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "14px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No district found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredDistricts.map((district) => (
            <button
              key={district}
              type="button"
              onClick={() => openDistrict(district)}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow:
                  "0 4px 12px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "12px",
                }}
              >
                📍
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "18px",
                }}
              >
                {district}
              </h3>

              <p
                style={{
                  color: "#64748b",
                  margin: "8px 0 0",
                  fontSize: "14px",
                }}
              >
                View and manage work orders
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}