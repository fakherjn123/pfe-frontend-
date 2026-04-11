import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../shared/components/navigation/Navbar";
import ProtectedRoute from "../shared/guards/ProtectedRoute";
import AdminLayout from "../shared/components/layout/AdminLayout";

// Public pages
import CarsPage from "../features/cars/pages/CarsPage";
import HomePage from "../features/cars/pages/HomePage";
import CarDetailPage from "../features/cars/pages/CarDetailPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import OAuthSuccessPage from "../features/auth/pages/OAuthSuccessPage";
import ContactPage from "../features/contact/pages/ContactPage";

// Client pages
import MyRentalsPage from "../features/rentals/pages/MyRentalsPage";
import PaymentPage from "../features/payments/pages/PaymentPage";
import MyFacturesPage from "../features/factures/pages/MyFacturesPage";
import ProfilePage from "../features/auth/pages/ProfilePage";

// Admin pages
import DashboardPage from "../features/admin/pages/DashboardPage";
import AdminCarsPage from "../features/admin/pages/AdminCarsPage";
import ArchivedCarsPage from "../features/admin/pages/ArchivedCarsPage";
import ManagerPaymentsPage from "../features/admin/pages/ManagePaymentsPage";
import AllFacturesPage from "../features/admin/pages/AllFacturesPage";
import AllRentalsPage from "../features/admin/pages/AllRentalsPage";
import RentalHistoryPage from "../features/admin/pages/RentalHistoryPage";
import ReviewsPage from "../features/admin/pages/ReviewsPage";
import ServicesPage from "../features/admin/pages/ServicesPage";
import AdminContactPage from "../features/admin/pages/AdminContactPage";
import ClientsPage from "../features/admin/pages/ClientsPage";
import ClientDetailPage from "../features/admin/pages/ClientDetailPage";
import HeroBannerPage from "../features/admin/pages/HeroBannerPage";
import PromoCodesPage from "../features/admin/pages/PromoCodesPage.jsx";
import AIDashboardPage from "../features/admin/pages/AIDashboardPage";

// Admin page metadata (title for header)
const ADMIN_META = {
  "/dashboard":            { title: "Tableau de bord",    subtitle: "Vue d'ensemble de votre activité" },
  "/admin/cars":           { title: "Gestion des véhicules", subtitle: "Flotte active et archivée" },
  "/admin/cars/archived":  { title: "Véhicules archivés",  subtitle: "Historique de la flotte" },
  "/admin/payments":       { title: "Paiements",           subtitle: "Suivi des transactions" },
  "/admin/factures":       { title: "Factures",            subtitle: "Toutes les factures générées" },
  "/admin/rentals":        { title: "Locations",           subtitle: "Réservations en cours et passées" },
  "/admin/rentals/history":{ title: "Historique",          subtitle: "Archive mensuelle des locations" },
  "/admin/reviews":        { title: "Avis clients",        subtitle: "Modération des commentaires" },
  "/admin/services":       { title: "Maintenance",         subtitle: "Planification des entretiens" },
  "/admin/contacts":       { title: "Messages",            subtitle: "Messagerie client" },
  "/admin/clients":        { title: "Clients",             subtitle: "Base de données utilisateurs" },
  "/admin/hero":           { title: "Hero Banner",         subtitle: "Gestion de l'image d'accueil" },
  "/admin/promos":         { title: "Codes promos",        subtitle: "Gestion des réductions" },
  "/admin/ai-dashboard":   { title: "AI Dashboard",        subtitle: "Analyse prédictive & recommandations intelligentes" },
};

// Helper wrapper: applies AdminLayout + ProtectedRoute
function AdminPage({ path, children }) {
  const meta = ADMIN_META[path] || {};
  return (
    <ProtectedRoute role="admin">
      <AdminLayout title={meta.title} subtitle={meta.subtitle}>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── PUBLIC — with Navbar ───────────────────────── */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/cars" element={<><Navbar /><CarsPage /></>} />
        <Route path="/cars/:id" element={<><Navbar /><CarDetailPage /></>} />
        <Route path="/contact" element={<><Navbar /><ContactPage /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />

        {/* ── CLIENT — with Navbar ───────────────────────── */}
        <Route path="/rentals" element={
          <ProtectedRoute><Navbar /><MyRentalsPage /></ProtectedRoute>
        } />
        <Route path="/payment/:rentalId" element={
          <ProtectedRoute><Navbar /><PaymentPage /></ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute><Navbar /><PaymentPage /></ProtectedRoute>
        } />
        <Route path="/facture" element={
          <ProtectedRoute><Navbar /><MyFacturesPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Navbar /><ProfilePage /></ProtectedRoute>
        } />

        {/* ── ADMIN — with AdminLayout (sidebar) ────────── */}
        <Route path="/dashboard" element={
          <AdminPage path="/dashboard"><DashboardPage /></AdminPage>
        } />
        <Route path="/admin/cars" element={
          <AdminPage path="/admin/cars"><AdminCarsPage /></AdminPage>
        } />
        <Route path="/admin/cars/archived" element={
          <AdminPage path="/admin/cars/archived"><ArchivedCarsPage /></AdminPage>
        } />
        <Route path="/admin/payments" element={
          <AdminPage path="/admin/payments"><ManagerPaymentsPage /></AdminPage>
        } />
        <Route path="/admin/factures" element={
          <AdminPage path="/admin/factures"><AllFacturesPage /></AdminPage>
        } />
        <Route path="/admin/rentals" element={
          <AdminPage path="/admin/rentals"><AllRentalsPage /></AdminPage>
        } />
        <Route path="/admin/rentals/history" element={
          <AdminPage path="/admin/rentals/history"><RentalHistoryPage /></AdminPage>
        } />
        <Route path="/admin/reviews" element={
          <AdminPage path="/admin/reviews"><ReviewsPage /></AdminPage>
        } />
        <Route path="/admin/services" element={
          <AdminPage path="/admin/services"><ServicesPage /></AdminPage>
        } />
        <Route path="/admin/contacts" element={
          <AdminPage path="/admin/contacts"><AdminContactPage /></AdminPage>
        } />
        <Route path="/admin/clients" element={
          <AdminPage path="/admin/clients"><ClientsPage /></AdminPage>
        } />
        <Route path="/admin/clients/:id" element={
          <AdminPage path="/admin/clients"><ClientDetailPage /></AdminPage>
        } />
        <Route path="/admin/hero" element={
          <AdminPage path="/admin/hero"><HeroBannerPage /></AdminPage>
        } />
        <Route path="/admin/promos" element={
          <AdminPage path="/admin/promos"><PromoCodesPage /></AdminPage>
        } />
        <Route path="/admin/ai-dashboard" element={
          <AdminPage path="/admin/ai-dashboard"><AIDashboardPage /></AdminPage>
        } />

        {/* ── FALLBACKS ─────────────────────────────────── */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}