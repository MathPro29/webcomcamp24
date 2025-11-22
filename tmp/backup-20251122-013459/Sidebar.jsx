import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const sidebarItems = [
    { name: 'หน้าหลัก', path: '/admin/dashboard', icon: '🏠' },
    { name: 'สมาชิก', path: '/admin/users', icon: '👥' },
    { name: 'ตรวจสอบการโอนเงิน', path: '/admin/receipts', icon: '💵' },
    { name: 'แก้ไขหน้าเว็ปไซต์', path: '/admin/editweb', icon: '⚙️' },
    { name: 'กลับสู่หน้าเว็บไซต์', path: '/', icon: '🔙' },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    // สำหรับ Desktop: ใช้ hover state, สำหรับ Mobile: ใช้ isOpen
    const isExpanded = window.innerWidth >= 1024 ? isHovered : isOpen;

    const sidebarWidthClass = isExpanded ? 'w-64' : 'w-20';
    const textVisibilityClass = isExpanded ? 'opacity-100 ml-3 inline-block' : 'opacity-0 w-0 overflow-hidden';

    return (
        <div
            onMouseEnter={() => window.innerWidth >= 1024 && setIsHovered(true)}
            onMouseLeave={() => window.innerWidth >= 1024 && setIsHovered(false)}
            className={`
        ${sidebarWidthClass} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl 
        transition-all duration-300 ease-in-out
        fixed lg:sticky top-0 h-screen z-30
      `}
        >
            <div className="p-4 border-b border-gray-700">
                <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center">
                        <span className={`text-3xl ${isExpanded ? 'mr-2' : ''}`}>🛠️</span>
                        <span className={`text-xl font-bold text-indigo-400 transition-all duration-300 ${textVisibilityClass}`}>
                            Admin Panel
                        </span>
                    </div>

                    <button
                        onClick={toggleSidebar}
                        className={`lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 group ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        aria-label="Close Sidebar"
                    >
                        <svg
                            className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* --- แก้ตรงนี้: overflow-y ขึ้นกับ isExpanded + ใส่ no-scrollbar เมื่อย่อ --- */}
            <nav className={`flex-1 px-3 py-4 overflow-y-auto no-scrollbar`} style={{ minHeight: 0, scrollbarGutter: 'stable' }}>
                <ul className="space-y-1">
                    {sidebarItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center rounded-lg transition-all duration-200 group relative
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                                        : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                                    } 
                  ${isExpanded ? 'px-4 py-3 justify-start' : 'px-3 py-3 justify-center'}`
                                }
                                end={item.path === '/admin'}
                            >
                                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${textVisibilityClass}`}>
                                    {item.name}
                                </span>

                                {!isExpanded && !isHovered && (
                                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
                                        {item.name}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-3 border-t border-gray-700">
                <button
                    type="button"
                    onClick={() => {
                        // ล้าง token แล้วไปหน้า login
                        localStorage.removeItem('adminToken');
                        navigate('/admin/login');
                    }}
                    className={`flex items-center rounded-lg w-full text-left hover:bg-red-600/90 transition-all duration-200 text-gray-300 hover:text-white group relative
            ${isExpanded ? 'px-4 py-3 justify-start' : 'px-3 py-3 justify-center'}`}
                    aria-label="Logout"
                >
                    <span className="text-2xl flex-shrink-0">🚪</span>
                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${textVisibilityClass}`}>
                        Logout
                    </span>

                    {!isExpanded && !isHovered && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
