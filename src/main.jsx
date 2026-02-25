import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./app/router";
import { AuthProvider } from "./features/auth/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);