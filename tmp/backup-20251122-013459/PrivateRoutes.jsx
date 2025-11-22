// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ตรวจ token (JWT) ใน localStorage: แยก payload แล้วเช็ก exp ถ้ามี
 * - ถ้า token หมดอายุหรือตรวจไม่ได้ จะลบแล้ว redirect ไปหน้า login
 * - ในการใช้งานจริง/production ควร verify กับ backend หรือเก็บ session เป็น HttpOnly cookie
 */
function isTokenValid(token) {
    if (!token) return false;
    try {
        // เบื้องต้น decode payload ของ JWT (base64url)
        const parts = token.split('.');
        if (parts.length < 2) return false;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload && payload.exp) {
            // exp เป็นวินาทีตั้งแต่ epoch
            return Date.now() / 1000 < payload.exp;
        }
        // ถ้าไม่มี exp ให้ถือว่า token ใช้ได้ (หรือเปลี่ยนเป็น false ตามนโยบาย)
        return true;
    } catch (err) {
        console.error('Invalid token format', err);
        return false;
    }
}

export default function PrivateRoute({ children }) {
    const token = localStorage.getItem('adminToken');
    const location = useLocation();

    const valid = isTokenValid(token);
    if (!valid) {
        // ถอน token ถ้าไม่ถูกต้อง/หมดอายุ
        if (token) localStorage.removeItem('adminToken');
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}
