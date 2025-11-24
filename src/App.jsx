// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/mainlayouts.jsx";
import AdminLayout from "./layouts/adminlayout.jsx";
import PrivateRoute from "./routes/PrivateRoutes.jsx";
import Home from "./pages/home.jsx";
import RegisterForm from "./pages/registerform.jsx";
import Login from "./pages/admin/login.jsx";
import Dashboard from "./pages/admin/dashboard.jsx";
import ScrollToTop from "./components/scrolltotop.jsx";
import NotFound from "./pages/notfound.jsx";
import Users from "./pages/admin/users.jsx";
import Receipts from "./pages/admin/receipts.jsx";
import EditWeb from "./pages/admin/editweb.jsx";
import Payment from "./pages/payment.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* --- 🛡️ Routes สำหรับ Admin (ไม่มี Navbar) 🛡️ --- */}
        <Route path="/admin/login" element={<Login />} />
        <Route element={<PrivateRoute>
          <AdminLayout />
        </PrivateRoute>}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/receipts" element={<Receipts />} />
          <Route path="/admin/editweb" element={<EditWeb />} />
        </Route>

        {/* --- 🏠 Routes สำหรับผู้ใช้งานทั่วไป (มี Navbar) 🏠 --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          {/* ✅ แก้ไข: ใช้ RegisterForm ตามชื่อที่นำเข้า หรือเปลี่ยนชื่อใน Route เป็น RegisterForm ✅ */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/payment" element={<Payment Page/>} />
        </Route>

        {/* ⚠️ Route สำหรับหน้า Not Found ⚠️ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* ⚠️ ไม่ต้องมีแท็กเปิด/ปิด Routes ซ้ำอีก ⚠️ */}
    </>
  );
}
