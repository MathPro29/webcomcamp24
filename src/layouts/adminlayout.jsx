import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../src/components/sidebar.jsx';

// Header component ที่ปรับปรุงแล้ว
const Header = ({ toggleSidebar, isOpen }) => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="bg-white shadow-md p-4 flex items-center justify-center lg:justify-start z-20 sticky top-0">
            {/* Hamburger Button (แสดงบนมือถือเท่านั้น เพราะบน Desktop ใช้ hover) */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden  text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group absolute left-4"
                aria-label="Toggle Sidebar"
            >
                <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Page Title */}
            <h1 className="text-xl font-semibold text-gray-800">
                <span className="hidden lg:inline">Dashboard</span>
                <span className="lg:hidden">Dashboard</span>
            </h1>

        </header>
    );
};

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // ตั้งค่าเริ่มต้นให้ Sidebar ย่ออยู่ (ไม่ต้องเปิดบน Desktop)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                // บนมือถือให้ปิด sidebar
                setIsSidebarOpen(false);
            }
            // บน Desktop ไม่ต้องทำอะไร (ใช้ hover แทน)
        };

        // เรียกครั้งแรก
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // กำหนดความกว้างของ Content Area (ตอนนี้จะเป็น ml-20 เสมอบน Desktop เพราะ sidebar ย่ออยู่)
    const mainContentMargin = 'lg:ml-20';

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${mainContentMargin}`}
            >
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />

                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Overlay สำหรับ Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
}