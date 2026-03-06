import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode"; // Assume jwt-decode is needed, or we can just parse from base64 if we want to avoid deps.

export default function OAuthSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Note: login in AuthContext expects data, but we just need to set state.

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            try {
                // Basic JWT decode without library
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const user = JSON.parse(jsonPayload);

                // Save to localStorage similar to AuthContext login
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                // Trigger a reload to update the context since we don't have a direct raw setUser exposed in AuthContext
                // Or we can just redirect and let the next page load the context.
                window.location.href = user.role === "admin" ? "/dashboard" : "/";

            } catch (err) {
                console.error("Failed to parse token", err);
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #f3f3f3", borderTop: "3px solid #0a0a0a", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0a0a0a", margin: "0 0 8px" }}>Connexion en cours...</h2>
                <p style={{ fontSize: 13, color: "#666" }}>Veuillez patienter pendant que nous vous redirigeons.</p>
                <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
            </div>
        </div>
    );
}
