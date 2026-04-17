import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./app/router";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
        success: {
          iconTheme: { primary: '#16a34a', secondary: '#fff' },
          style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#fff' },
          style: { background: '#fef2f2', color: '#7f1d1d', border: '1px solid #fecaca' },
        },
      }}
    />
    <Router />
  </AuthProvider>
);