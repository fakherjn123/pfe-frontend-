import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import CarsPage from "../features/cars/pages/CarsPage";
import DashboardPage from "../features/admin/pages/DashboardPage";
import ProtectedRoute from "../shared/guards/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CarsPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}