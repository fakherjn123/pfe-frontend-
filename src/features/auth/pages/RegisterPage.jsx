import { useState } from "react";
import { registerService } from "../api/auth.service";
import { useNavigate, Link } from "react-router-dom";

const sans = "'Inter', 'Helvetica Neue', sans-serif";
const inputStyle = {
  width: "100%", background: "#fafafa", border: "1px solid #e8e8e8",
  color: "#0a0a0a", padding: "11px 14px", fontSize: 14,
  fontFamily: sans, borderRadius: 9, outline: "none", boxSizing: "border-box",
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await registerService(form); navigate("/login"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed."); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#fafafa", fontFamily: sans,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0a0a0a", letterSpacing: "0.06em" }}>JNAYEH</span>
            <span style={{ fontSize: 12, color: "#bbb", marginLeft: 8 }}>LOCATION</span>
          </Link>
        </div>

        <div style={{
          background: "#fff", border: "1px solid #ebebeb", borderRadius: 16,
          padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}>
          <h1 style={{
            color: "#0a0a0a", fontSize: 24, fontWeight: 800,
            margin: "0 0 6px", letterSpacing: "-0.02em",
          }}>Create account</h1>
          <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 28px" }}>
            Join Jnayeh Fleet Rental
          </p>

          <form onSubmit={handleSubmit}>
            {[
              { key: "name", label: "Full name", type: "text", placeholder: "John Doe" },
              { key: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
              { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ color: "#666", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>{label}</label>
                <input type={type} required value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} style={inputStyle} />
              </div>
            ))}

            {error && (
              <div style={{
                background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8,
                color: "#dc2626", fontSize: 13, padding: "10px 14px", marginBottom: 16,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "#0a0a0a", color: "#fff", border: "none",
              padding: "12px", fontSize: 14, fontFamily: sans, fontWeight: 700,
              borderRadius: 9, cursor: "pointer", marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}>{loading ? "Creating account..." : "Create account"}</button>
          </form>
        </div>

        <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0a0a0a", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}