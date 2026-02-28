import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from "./app/router";
import { AuthProvider } from "./features/auth/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Router />
  </AuthProvider>
);