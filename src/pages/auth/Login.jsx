import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { login } from "../../services/authService";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await login(cleanEmail, password);

      const loggedInUser = {
        uid: result.firebaseUser.uid,
        email: result.firebaseUser.email,
        ...result.profile,
      };

      setUser(loggedInUser);

      if (loggedInUser.role === "admin") {
        navigate("/admin", {
          replace: true,
        });
        return;
      }

      if (loggedInUser.role === "employee") {
        navigate("/employee", {
          replace: true,
        });
        return;
      }

      if (loggedInUser.role === "customer") {
        navigate("/customer", {
          replace: true,
        });
        return;
      }

      setUser(null);

      throw new Error(
        "No valid role is assigned to this account."
      );
    } catch (loginError) {
      console.error("Login error:", loginError);

      switch (loginError.code) {
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;

        case "auth/user-not-found":
          setError("No account was found with this email.");
          break;

        case "auth/wrong-password":
          setError("Incorrect password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        case "auth/too-many-requests":
          setError(
            "Too many failed login attempts. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            loginError.message ||
              "Unable to log in. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}

      <div className="left-panel">
        <div className="logo">V</div>

        <h1
          style={{
            fontSize: "45px",
            marginBottom: "15px",
          }}
        >
          VATS Innovation
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#cbd5e1",
          }}
        >
          Workforce Management System
        </p>

        <div
          style={{
            marginTop: "35px",
            maxWidth: "450px",
            color: "#cbd5e1",
            lineHeight: "1.8",
          }}
        >
          Manage employees, attendance, projects, work orders and
          progress reports from one secure system.
        </div>
      </div>

      {/* Right Panel */}

      <div className="right-panel">
        <div className="card">
          <h2
            style={{
              textAlign: "center",
              marginBottom: "8px",
              color: "#0f172a",
            }}
          >
            Welcome Back
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              marginTop: 0,
              marginBottom: "30px",
              lineHeight: "1.6",
            }}
          >
            Enter your registered email and password to continue.
          </p>

          <form onSubmit={handleLogin}>
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#334155",
                  fontWeight: "700",
                }}
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: loading ? "#f8fafc" : "#ffffff",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#334155",
                  fontWeight: "700",
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "13px 52px 13px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    background: loading ? "#f8fafc" : "#ffffff",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "12px",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#2563eb",
                    fontWeight: "700",
                    cursor: loading ? "not-allowed" : "pointer",
                    padding: "4px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "12px 14px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",
                  borderRadius: "9px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                border: "none",
                background: loading ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                padding: "14px",
                borderRadius: "9px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "0.2s",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div
            style={{
              marginTop: "22px",
              paddingTop: "18px",
              borderTop: "1px solid #e2e8f0",
              textAlign: "center",
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            Admin and employee accounts must already exist in Firebase
            Authentication and Firestore.
          </div>
        </div>
      </div>
    </div>
  );
}