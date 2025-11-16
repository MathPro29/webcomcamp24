import React, { useState } from 'react';
import { Search, Edit, Trash2, Eye, Filter, Download, UserPlus, RefreshCcw } from 'lucide-react';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // ข้อมูลเริ่มต้น (จำลองจาก API)
    const initialUsers = [
        { id: 1, name: 'สมชาย ใจดี', email: 'som@gmail.com', phone: '098-5555555', school: 'โรงเรียนสวนกุหลาบ', status: 'approved' },
        { id: 2, name: 'สมหญิง รักเรียน', email: 'somp@gmail.com', phone: '081-2345678', school: 'โรงเรียนเตรียมอุดมศึกษา', status: 'pending' },
        { id: 3, name: 'ประยุทธ์ มานะ', email: 'prayut@gmail.com', phone: '092-7654321', school: 'โรงเรียนสาธิตจุฬา', status: 'approved' },
        { id: 4, name: 'วิภา สดใส', email: 'wipa@gmail.com', phone: '065-9876543', school: 'โรงเรียนมหิดลวิทยานุสรณ์', status: 'rejected' },
        { id: 5, name: 'ธนา เก่งกล้า', email: 'tana@gmail.com', phone: '089-1122334', school: 'โรงเรียนกรุงเทพคริสเตียน', status: 'pending' },
    ];

    const [users, setUsers] = useState(initialUsers);

    // ฟังก์ชัน refresh ข้อมูล
    const refreshData = async () => {
        setIsRefreshing(true);
        
        // จำลองการเรียก API (ในการใช้งานจริงให้เรียก API ของคุณ)
        setTimeout(() => {
            // รีเซ็ตข้อมูลกลับไปเป็นค่าเริ่มต้น
            setUsers([...initialUsers]);
            setSelectedUsers([]);
            setSearchTerm('');
            setStatusFilter('all');
            setIsRefreshing(false);
        }, 800);

        /* ตัวอย่างการเรียก API จริง:
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsRefreshing(false);
        }
        */
    };

    const statusConfig = {
        approved: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800', icon: '✓' },
        pending: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
        rejected: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800', icon: '✗' }
    };

    // ฟิลเตอร์ข้อมูล
    const filteredUsers = users.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.school.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // จัดการ checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(filteredUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // จัดการสถานะ
    const handleStatusChange = (id, newStatus) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    const handleDelete = (id) => {
        if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) {
            setUsers(prev => prev.filter(u => u.id !== id));
            setSelectedUsers(prev => prev.filter(i => i !== id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) return;
        if (confirm(`คุณต้องการลบผู้ใช้ ${selectedUsers.length} คนใช่หรือไม่?`)) {
            setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
            setSelectedUsers([]);
        }
    };

    const exportData = () => {
        const csvContent = [
            ['ID', 'ชื่อ', 'อีเมล', 'เบอร์โทร', 'โรงเรียน', 'สถานะ'],
            ...filteredUsers.map(u => [u.id, u.name, u.email, u.phone, u.school, statusConfig[u.status].label])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'users_export.csv';
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการผู้ใช้งาน</h1>
                            <p className="text-gray-600">ทั้งหมด {users.length} คน | กำลังแสดง {filteredUsers.length} คน</p>
                        </div>
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md">
                            <UserPlus size={20} />
                            เพิ่มผู้ใช้ใหม่
                        </button>
                    </div>
                </div>

                {/* Stats*/}
                <div className="mt-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-800 text-sm font-medium mb-1">อนุมัติแล้ว</div>
                        <div className="text-2xl font-bold text-green-900">
                            {users.filter(u => u.status === 'approved').length} คน
                        </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-yellow-800 text-sm font-medium mb-1">รอดำเนินการ</div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {users.filter(u => u.status === 'pending').length} คน
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800 text-sm font-medium mb-1">ปฏิเสธ</div>
                        <div className="text-2xl font-bold text-red-900">
                            {users.filter(u => u.status === 'rejected').length} คน
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ, อีเมล, โรงเรียน..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
                            >
                                <option value="all">สถานะทั้งหมด</option>
                                <option value="approved">อนุมัติแล้ว</option>
                                <option value="pending">รอดำเนินการ</option>
                                <option value="rejected">ปฏิเสธ</option>
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={refreshData}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 disabled:text-gray-400 px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                        >
                            <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Download size={20} />
                            ส่งออก CSV
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="mt-4 flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-blue-800 font-medium">เลือกแล้ว {selectedUsers.length} คน</span>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Trash2 size={16} />
                                ลบที่เลือก
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">อีเมล</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เบอร์โทร</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">โรงเรียน</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={48} className="text-gray-300" />
                                                <p className="text-lg font-medium">ไม่พบข้อมูล</p>
                                                <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => handleSelectOne(user.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.school}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.status}
                                                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 ${statusConfig[user.status].color}`}
                                                >
                                                    <option value="approved">อนุมัติแล้ว</option>
                                                    <option value="pending">รอดำเนินการ</option>
                                                    <option value="rejected">ปฏิเสธ</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="ดูรายละเอียด"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}