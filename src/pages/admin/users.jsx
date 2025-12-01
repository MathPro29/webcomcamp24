import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Filter, Download, UserPlus, RefreshCcw, CheckCircle, XCircle, Clock, User } from 'lucide-react';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [users, setUsers] = useState([]);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch users from server
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/all`);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map(u => ({
                    id: u._id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email || '-',
                    phone: u.phone || '-',
                    school: u.school || '-',
                    status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending'
                }));
                setUsers(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchFullUser = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const fullUser = await res.json();
                // Map status for display
                fullUser.status = fullUser.status === 'success' ? 'approved' : fullUser.status === 'declined' ? 'rejected' : 'pending';
                return fullUser;
            }
        } catch (err) {
            console.error('Failed to fetch full user:', err);
        }
        return null;
    };

    // ฟังก์ชัน refresh ข้อมูล
    const refreshData = async () => {
        setIsRefreshing(true);
        await fetchUsers();
        setSelectedUsers([]);
        setSearchTerm('');
        setStatusFilter('all');
        setIsRefreshing(false);
    };

    const statusConfig = {
        approved: {
            label: 'อนุมัติแล้ว',
            color: 'bg-green-100 text-green-800 border-green-300',
            icon: <CheckCircle size={16} className="text-green-600" />
        },
        pending: {
            label: 'รอดำเนินการ',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            icon: <Clock size={16} className="text-yellow-600" />
        },
        rejected: {
            label: 'ปฏิเสธ',
            color: 'bg-red-100 text-red-800 border-red-300',
            icon: <XCircle size={16} className="text-red-600" />
        }
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
    const handleStatusChange = async (id, newStatus) => {
        const statusMap = { approved: 'success', pending: 'pending', rejected: 'declined' };
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: statusMap[newStatus] })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
                if (viewingUser && viewingUser._id === id) {
                    setViewingUser(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) {
            try {
                const res = await fetch(`${API_BASE}/api/users/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    setUsers(prev => prev.filter(u => u.id !== id));
                    setSelectedUsers(prev => prev.filter(i => i !== id));
                    if (viewingUser && viewingUser._id === id) {
                        setViewingUser(null);
                    }
                }
            } catch (err) {
                console.error('Failed to delete user:', err);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        if (confirm(`คุณต้องการลบผู้ใช้ ${selectedUsers.length} คนใช่หรือไม่?`)) {
            try {
                await Promise.all(
                    selectedUsers.map(id =>
                        fetch(`${API_BASE}/api/users/${id}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        })
                    )
                );
                setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
                setSelectedUsers([]);
            } catch (err) {
                console.error('Failed to delete users:', err);
            }
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

    const openUserModal = async (user) => {
        const fullUser = await fetchFullUser(user.id);
        if (fullUser) {
            setViewingUser(fullUser);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
                        <button className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md">
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
                            className="cursor-pointer flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 disabled:text-gray-400 px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                        >
                            <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={exportData}
                            className="cursor-pointer flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border ${statusConfig[user.status].color}`}
                                                >
                                                    <option value="approved">อนุมัติแล้ว</option>
                                                    <option value="pending">รอดำเนินการ</option>
                                                    <option value="rejected">ปฏิเสธ</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openUserModal(user)}
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

            {/* Modal แสดงรายละเอียดผู้ใช้ */}
            {viewingUser && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewingUser(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingUser(null)}
                            className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                        >
                            ×
                        </button>

                        <h3 className="text-xl font-bold mb-4">รายละเอียดผู้ใช้</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div>
                                <div className="text-sm text-gray-500">คำนำหน้า</div>
                                <div className="font-medium">{viewingUser.prefix || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ชื่อ</div>
                                <div className="font-medium">{viewingUser.firstName || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">นามสกุล</div>
                                <div className="font-medium">{viewingUser.lastName || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ชื่อเล่น</div>
                                <div className="font-medium">{viewingUser.nickname || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">วันเกิด</div>
                                <div className="font-medium">{formatDate(viewingUser.birthDate)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">อายุ</div>
                                <div className="font-medium">{viewingUser.age || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">เพศ</div>
                                <div className="font-medium">{viewingUser.gender || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">โรงเรียน</div>
                                <div className="font-medium">{viewingUser.school || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ชั้น</div>
                                <div className="font-medium">{viewingUser.grade || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">จังหวัด</div>
                                <div className="font-medium">{viewingUser.province || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">เบอร์โทร</div>
                                <div className="font-medium">{viewingUser.phone || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">เบอร์โทรผู้ปกครอง</div>
                                <div className="font-medium">{viewingUser.parentPhone || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">อีเมล</div>
                                <div className="font-medium">{viewingUser.email || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Line ID</div>
                                <div className="font-medium">{viewingUser.lineId || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ขนาดเสื้อ</div>
                                <div className="font-medium">{viewingUser.shirtSize || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">อาการแพ้</div>
                                <div className="font-medium">{viewingUser.allergies || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">โรคประจำตัว</div>
                                <div className="font-medium">{viewingUser.medicalConditions || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ผู้ติดต่อฉุกเฉิน</div>
                                <div className="font-medium">{viewingUser.emergencyContact || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">เบอร์โทรฉุกเฉิน</div>
                                <div className="font-medium">{viewingUser.emergencyPhone || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">สถานะ</div>
                                <div className="flex items-center gap-2 mt-1">
                                    {statusConfig[viewingUser.status]?.icon}
                                    <span className="font-medium">{statusConfig[viewingUser.status]?.label}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">มีแล็ปท็อป</div>
                                <div className="font-medium">{viewingUser.laptop === 'Yes' ? 'ใช่' : viewingUser.laptop === 'No' ? 'ไม่' : '-'}</div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="text-sm text-gray-500">วันที่สร้าง</div>
                                <div className="font-medium">{formatDate(viewingUser.createdAt)}</div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="text-sm text-gray-500">วันที่อัพเดทล่าสุด</div>
                                <div className="font-medium">{formatDate(viewingUser.updatedAt)}</div>
                            </div>
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
}