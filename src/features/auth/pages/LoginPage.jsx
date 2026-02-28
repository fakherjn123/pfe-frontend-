// LoginPage.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const inputStyle = {
  width: "100%", background: "#fafafa", border: "1px solid #e8e8e8",
  color: "#0a0a0a", padding: "11px 14px", fontSize: 14,
  fontFamily: sans, borderRadius: 9, outline: "none",
  boxSizing: "border-box", transition: "border 0.15s",
};

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await login({ email, password });
    navigate("/"); // redirect فقط
  } catch (err) {
    if (err.response?.status === 401) {
      setError("Invalid email or password");
    } else {
      setError("Server error");
    }
  }
};
  return (
    <div style={{
      minHeight: "100vh", background: "#fafafa", fontFamily: sans,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0a0a0a", letterSpacing: "0.06em" }}>JNAYEH</span>
            <span style={{ fontSize: 12, color: "#bbb", marginLeft: 8 }}>LOCATION</span>
          </Link>
        </div>

        <div style={{
          background: "#fff", border: "1px solid #ebebeb",
          borderRadius: 16, padding: "36px 32px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}>
          <h1 style={{
            color: "#0a0a0a", fontSize: 24, fontWeight: 800,
            margin: "0 0 6px", letterSpacing: "-0.02em",
          }}>Welcome back</h1>
          <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 28px" }}>
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: "#666", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Email address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#666", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" style={inputStyle} />
            </div>

            {error && (
              <div style={{
                background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8,
                color: "#dc2626", fontSize: 13, padding: "10px 14px", marginBottom: 16,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "#0a0a0a", color: "#fff", border: "none",
              padding: "12px", fontSize: 14, fontFamily: sans, fontWeight: 700,
              borderRadius: 9, cursor: "pointer", letterSpacing: "-0.01em",
              opacity: loading ? 0.7 : 1,
            }}>{loading ? "Signing in..." : "Sign in"}</button>
          </form>
        </div>

        <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", marginTop: 20 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#0a0a0a", fontWeight: 600, textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}