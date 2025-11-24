// src/routes/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
                if (!mounted) return;
                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setIsAuth(Boolean(data?.authenticated));
                } else {
                    setIsAuth(false);
                }
            } catch (err) {
                // On network/server error consider unauthenticated
                setIsAuth(false);
            } finally {
                if (mounted) setChecking(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    if (checking) return null;
    if (!isAuth) return <Navigate to="/admin/login" state={{ from: location }} replace />;
    return children;
}


