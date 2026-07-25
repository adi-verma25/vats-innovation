export default function EmployeeForm({
  employee,
  onChange,
  onSubmit,
  loading,
  buttonText = "Save Employee",
}) {
  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: "#ffffff",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={fieldStyle}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={employee.name || ""}
            onChange={onChange}
            placeholder="Employee full name"
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={employee.email || ""}
            onChange={onChange}
            placeholder="employee@example.com"
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={employee.phone || ""}
            onChange={onChange}
            placeholder="Phone number"
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="department">Department</label>
          <input
            id="department"
            type="text"
            name="department"
            value={employee.department || ""}
            onChange={onChange}
            placeholder="Department"
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="position">Designation</label>
          <input
            id="position"
            type="text"
            name="position"
            value={employee.position || ""}
            onChange={onChange}
            placeholder="Job position"
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="salary">Salary</label>
          <input
            id="salary"
            type="number"
            name="salary"
            value={employee.salary || ""}
            onChange={onChange}
            placeholder="Monthly salary"
            style={inputStyle}
            min="0"
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={employee.gender || ""}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            value={employee.dateOfBirth || ""}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="joiningDate">Date of Joining</label>
          <input
            id="joiningDate"
            type="date"
            name="joiningDate"
            value={employee.joiningDate || ""}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={employee.status || "Active"}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div
        style={{
          ...fieldStyle,
          marginTop: "20px",
        }}
      >
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          value={employee.address || ""}
          onChange={onChange}
          placeholder="Employee address"
          rows="4"
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: "10px",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        {loading ? "Saving..." : buttonText}
      </button>
    </form>
  );
}