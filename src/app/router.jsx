import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../shared/components/navigation/Navbar";
import ProtectedRoute from "../shared/guards/ProtectedRoute";
import AdminCarsPage from "../pages/Admin/Cars"; // Use the new page
import CarDetailPage from "../features/cars/pages/CarDetailPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CarsPage from "../features/cars/pages/CarsPage";
import LoginPage from "../features/auth/pages/LoginPage";
import OAuthSuccessPage from "../features/auth/pages/OAuthSuccessPage";
import DashboardPage from "../pages/Admin/Dashboard"; // Use the main Feature Dashboard
import MyRentalsPage from "../features/rentals/pages/MyRentalsPage";
import PaymentPage from "../features/payments/pages/PaymentPage";
import MyFacturesPage from "../features/factures/pages/MyFacturesPage";
import AllFacturesPage from "../features/admin/pages/AllFacturesPage";
import AllRentalsPage from "../features/admin/pages/AllRentalsPage";
import RentalHistoryPage from "../features/admin/pages/RentalHistoryPage";
import ManagerPaymentsPage from "../features/admin/pages/ManagePaymentsPage";
import ReviewsPage from "../pages/Admin/Reviews";
import ClientsPage from "../pages/Admin/Clients";
import ClientDetail from "../pages/Admin/ClientDetail";
import ServicesPage from "../pages/Admin/Services";

export default function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<CarsPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />

        {/* CLIENT */}
        <Route path="/rentals" element={
          <ProtectedRoute><MyRentalsPage /></ProtectedRoute>
        } />
        <Route path="/payment/:rentalId" element={
          <ProtectedRoute><PaymentPage /></ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute><PaymentPage /></ProtectedRoute>
        } />
        <Route path="/facture" element={
          <ProtectedRoute><MyFacturesPage /></ProtectedRoute>
        } />

        {/* ADMIN */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="admin"><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/cars" element={
          <ProtectedRoute role="admin"><AdminCarsPage /></ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute role="admin"><ManagerPaymentsPage /></ProtectedRoute>
        } />
        <Route path="/admin/factures" element={
          <ProtectedRoute role="admin"><AllFacturesPage /></ProtectedRoute>
        } />
        <Route path="/admin/rentals" element={
          <ProtectedRoute role="admin"><AllRentalsPage /></ProtectedRoute>
        } />
        <Route path="/admin/rentals/history" element={
          <ProtectedRoute role="admin"><RentalHistoryPage /></ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute role="admin"><ReviewsPage /></ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute role="admin"><ServicesPage /></ProtectedRoute>
        } />
        <Route path="/admin/clients" element={
          <ProtectedRoute role="admin"><ClientsPage /></ProtectedRoute>
        } />
        <Route path="/admin/clients/:id" element={
          <ProtectedRoute role="admin"><ClientDetail /></ProtectedRoute>
        } />

        {/* FALLBACKS */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}