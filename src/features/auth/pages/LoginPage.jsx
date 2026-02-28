// LoginPage.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/"); // redirect فقط
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="text-slate-900 text-xl font-extrabold tracking-tight group-hover:text-indigo-600 transition-colors">JNAYEH</span>
            <span className="w-px h-5 bg-slate-300" />
            <span className="text-slate-500 text-xs font-semibold tracking-widest">LOCATION</span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h1 className="text-slate-900 text-2xl font-extrabold mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mb-8 font-medium">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-slate-600 text-xs font-bold block mb-2 uppercase tracking-wide">
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className="text-slate-600 text-xs font-bold block mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 text-white border-0 py-3.5 px-4 text-sm font-bold rounded-xl tracking-wide transition-all shadow-sm focus:ring-4 focus:ring-slate-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-slate-500 text-sm font-medium text-center mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-slate-900 font-bold hover:text-indigo-600 transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}