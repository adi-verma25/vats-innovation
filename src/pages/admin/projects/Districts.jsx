import { useNavigate, useParams } from "react-router-dom";

const biharDistricts = [
  { id: "araria", name: "Araria" },
  { id: "arwal", name: "Arwal" },
  { id: "aurangabad", name: "Aurangabad" },
  { id: "banka", name: "Banka" },
  { id: "begusarai", name: "Begusarai" },
  { id: "bhagalpur", name: "Bhagalpur" },
  { id: "bhojpur", name: "Bhojpur" },
  { id: "buxar", name: "Buxar" },
  { id: "darbhanga", name: "Darbhanga" },
  { id: "east-champaran", name: "East Champaran" },
  { id: "gaya", name: "Gaya" },
  { id: "gopalganj", name: "Gopalganj" },
  { id: "jamui", name: "Jamui" },
  { id: "jehanabad", name: "Jehanabad" },
  { id: "kaimur", name: "Kaimur" },
  { id: "katihar", name: "Katihar" },
  { id: "khagaria", name: "Khagaria" },
  { id: "kishanganj", name: "Kishanganj" },
  { id: "lakhisarai", name: "Lakhisarai" },
  { id: "madhepura", name: "Madhepura" },
  { id: "madhubani", name: "Madhubani" },
  { id: "munger", name: "Munger" },
  { id: "muzaffarpur", name: "Muzaffarpur" },
  { id: "nalanda", name: "Nalanda" },
  { id: "nawada", name: "Nawada" },
  { id: "patna", name: "Patna" },
  { id: "purnia", name: "Purnia" },
  { id: "rohtas", name: "Rohtas" },
  { id: "saharsa", name: "Saharsa" },
  { id: "samastipur", name: "Samastipur" },
  { id: "saran", name: "Saran" },
  { id: "sheikhpura", name: "Sheikhpura" },
  { id: "sheohar", name: "Sheohar" },
  { id: "sitamarhi", name: "Sitamarhi" },
  { id: "siwan", name: "Siwan" },
  { id: "supaul", name: "Supaul" },
  { id: "vaishali", name: "Vaishali" },
  { id: "west-champaran", name: "West Champaran" },
];

export default function Districts() {
  const navigate = useNavigate();
  const { stateId } = useParams();

  const openDistrictWorkOrders = (district) => {
    navigate(
      `/admin/projects/states/${stateId}/districts/${district.id}/work-orders`,
      {
        state: {
          districtName: district.name,
        },
      }
    );
  };

  return (
    <div
      style={{
        padding: "24px",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#1f2937",
          }}
        >
          Districts
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
          }}
        >
          Select a district to view its work orders.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {biharDistricts.map((district) => (
          <button
            key={district.id}
            type="button"
            onClick={() => openDistrictWorkOrders(district)}
            style={{
              padding: "20px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                color: "#111827",
              }}
            >
              {district.name}
            </h3>

            <p
              style={{
                margin: "8px 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              View work orders
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}