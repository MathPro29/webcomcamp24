// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ตัวอย่างตรวจ auth แบบง่าย: เช็ก token ใน localStorage
 * ปรับให้เป็นการเช็กจาก context / redux / API ตามระบบจริงของท่าน
 */
export default function PrivateRoute({ children }) {
    const isAuth = Boolean(localStorage.getItem("adminToken")); // เปลี่ยนตามระบบจริง
    const location = useLocation();

    if (!isAuth) {
        // ส่งไปหน้า login พร้อม return url เดิม (option)
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
}
