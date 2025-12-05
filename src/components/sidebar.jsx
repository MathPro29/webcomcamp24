import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, MessageSquare, ArrowLeft, Shield, X, LogOut, Menu } from 'lucide-react';

const sidebarItems = [
    { name: 'หน้าหลัก', path: '/admin/dashboard', icon: Home },
    { name: 'สมาชิก', path: '/admin/users', icon: Users },
    { name: 'ควบคุมฟอร์ม', path: '/admin/inbox', icon: MessageSquare },
    { name: 'กลับสู่หน้าเว็บไซต์', path: '/', icon: ArrowLeft },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State สำหรับควบคุมการขยาย/ย่อบนจอใหญ่
    const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

    // ตรวจสอบว่าอยู่บนจอใหญ่หรือไม่
    const isLargeScreen = typeof window !== 'undefined' && window.innerWidth >= 1024;
    
    // กำหนดว่า sidebar ควรขยายหรือไม่
    // - Mobile: ใช้ isOpen (แสดง/ซ่อน)
    // - Desktop: ใช้ isDesktopExpanded (ขยาย/ย่อ)
    const isExpanded = isLargeScreen ? isDesktopExpanded : isOpen;

    const sidebarWidthClass = isExpanded ? 'w-64' : 'w-20';
    const textVisibilityClass = isExpanded ? 'opacity-100 ml-3 inline-block' : 'opacity-0 w-0 overflow-hidden';

    // เมื่อเปลี่ยนหน้าบน mobile ให้ปิด sidebar
    useEffect(() => {
        if (window.innerWidth < 1024 && isOpen) {
            toggleSidebar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // ฟังก์ชันสำหรับปิด sidebar บน mobile
    const closeOnMobileIfNeeded = () => {
        if (window.innerWidth < 1024 && isOpen) {
            toggleSidebar();
        }
    };

    // ฟังก์ชันสำหรับ toggle ขยาย/ย่อบน desktop
    const toggleDesktopExpand = () => {
        setIsDesktopExpanded(!isDesktopExpanded);
    };

    return (
        <div
            className={` cursor-pointer
        ${sidebarWidthClass} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl 
        transition-all duration-300 ease-in-out
        fixed lg:sticky top-0 h-screen z-30 
      `}
            aria-expanded={isExpanded}
        >
            <div className="cursor-pointer p-4 border-b border-gray-700">
                <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center">
                        <Shield size={32} className={`text-indigo-400 ${isExpanded ? 'mr-2' : ''}`} />
                        <span className={`text-xl font-bold text-indigo-400 transition-all duration-300 ${textVisibilityClass}`}>
                            Admin Panel
                        </span>
                    </div>

                    {/* ปุ่มปิดสำหรับ mobile */}
                    <button
                        onClick={toggleSidebar}
                        className={`cursor-pointer lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        aria-label="Close sidebar"
                    >
                        <X size={24} />
                    </button>

                    {/* ปุ่มขยาย/ย่อสำหรับ desktop */}
                    <button
                        onClick={toggleDesktopExpand}
                        className="hidden lg:block cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                        aria-label={isDesktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar" style={{ minHeight: 0, scrollbarGutter: 'stable' }}>
                <ul className="space-y-1">
                    {sidebarItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                onClick={closeOnMobileIfNeeded}
                                className={({ isActive }) =>
                                    `flex items-center rounded-lg transition-all duration-200 group relative
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                                        : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                                    } 
                  ${isExpanded ? 'px-4 py-3 justify-start' : 'px-3 py-3 justify-center'}`
                                }
                                end={item.path === '/admin'}
                                title={!isExpanded ? item.name : undefined}
                            >
                                <item.icon size={20} className="flex-shrink-0" />
                                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${textVisibilityClass}`}>
                                    {item.name}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-3 border-t border-gray-700">
                <button
                    onClick={async () => {
                        try {
                            await fetch((import.meta.env.VITE_API_URL || 'http://202.28.37.166:5000') + '/api/auth/logout', {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' }
                            }).catch(() => { });
                        } catch (e) {
                            // ignore
                        }
                        navigate('/admin/login', { replace: true });
                        if (window.innerWidth < 1024 && isOpen) toggleSidebar();
                    }}
                    className={`cursor-pointer flex items-center rounded-lg w-full text-left hover:bg-red-600/90 transition-all duration-200 text-gray-300 hover:text-white group relative
            ${isExpanded ? 'px-4 py-3 justify-start' : 'px-3 py-3 justify-center'}`}
                    aria-label="Logout"
                    title={!isExpanded ? 'Logout' : undefined}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${textVisibilityClass}`}>
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
}