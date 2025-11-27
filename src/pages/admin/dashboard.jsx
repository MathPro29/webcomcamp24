import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/all`);
            if (res.ok) {
                const data = await res.json();

                // Calculate stats
                const statsData = {
                    total: data.length,
                    pending: data.filter(u => u.status === 'pending').length,
                    approved: data.filter(u => u.status === 'success').length,
                    rejected: data.filter(u => u.status === 'declined').length
                };
                setStats(statsData);

                // Get recent 5 users
                const recent = data
                    .slice(0, 5)
                    .map(u => ({
                        id: u._id,
                        name: `${u.firstName} ${u.lastName}`,
                        email: u.email,
                        school: u.school,
                        status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending'
                    }));
                setRecentUsers(recent);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig = {
        approved: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="text-green-600" /> },
        pending: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} className="text-yellow-600" /> },
        rejected: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800', icon: <XCircle size={16} className="text-red-600" /> }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <button
                    onClick={() => {
                        setIsLoading(true);
                        fetchDashboardData();
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCcw size={18} />
                    รีเฟรช
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">ผู้สมัครทั้งหมด</p>
                        <Users size={20} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">รอตรวจสอบ</p>
                        <Clock size={20} className="text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">อนุมัติแล้ว</p>
                        <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">ปฏิเสธ</p>
                        <XCircle size={20} className="text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className='flex justify-end'>
                    <button onClick={() => window.location.href = '/admin/users'} className="cursor-pointer mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex justify-end items-center">
                        จัดการผู้สมัคร
                    </button>
                </div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">ผู้สมัครล่าสุด</h2>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        กำลังโหลดข้อมูล...
                    </div>
                ) : recentUsers.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        ไม่มีข้อมูลผู้สมัคร
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ชื่อ</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">อีเมล</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">โรงเรียน</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.school}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[user.status].color}`}>
                                                {statusConfig[user.status].icon}
                                                {statusConfig[user.status].label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}