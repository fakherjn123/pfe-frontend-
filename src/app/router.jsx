import { BrowserRouter,Routes,Route } from "react-router-dom";
import CarDetailPage from "../features/cars/pages/CarDetailPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

import CarsPage from "../features/cars/pages/CarsPage";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/admin/pages/DashboardPage";
import MyRentalsPage from "../features/rentals/pages/MyRentalsPage";
import PaymentPage from "../features/payments/pages/PaymentPage";
import MyFacturesPage from "../features/factures/pages/MyFacturesPage";
import AllFacturesPage from "../features/admin/pages/AllFacturesPage";
export default function Router(){

 return(
  <BrowserRouter>
   <Routes>
    <Route path="/payment/:rentalId" element={<PaymentPage />} />
    <Route path="/cars/:id" element={<CarDetailPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={<CarsPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/dashboard" element={<DashboardPage/>}/>
    <Route path="/rentals" element={<MyRentalsPage/>}/>
    <Route path="/payment" element={<PaymentPage/>}/>
    <Route path="/facture" element={<MyFacturesPage/>}/>
    <Route path="/admin/factures" element={<AllFacturesPage/>}/>
   </Routes>
  </BrowserRouter>
 );
}