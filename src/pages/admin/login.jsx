import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // API base (optional). If you have a backend, set VITE_API_URL.
    const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
    const from = location.state?.from?.pathname || '/admin/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }

        // Try server authentication first (if backend available)
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // accept HttpOnly cookie from server
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                // Server sets an HttpOnly cookie; do not store tokens in localStorage.
                navigate('/admin/dashboard', { replace: true });
                return;
            }
        } catch (err) {
            // network/server error -> fall through to show login failure
        }

        // If we reach here, authentication failed

        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Admin Login
                </h2>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <button
                        type="submit"
                        className="cursor-pointer w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                    <Link to="/" className="text-sm text-gray-600 hover:underline flex justify-center mt-2">
                        กลับสู่หน้าหลัก
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default Login;
