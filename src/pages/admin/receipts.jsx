import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, CheckCircle, XCircle, Clock, Filter, RefreshCcw, Image, AlertCircle } from 'lucide-react';



const Receipts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReceipts, setSelectedReceipts] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingSlip, setViewingSlip] = useState(null);
    const [receipts, setReceipts] = useState([]);

    const API_BASE = import.meta.env.VITE_API_URL || 'https://comcamp.csmju.com';


    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/api/payments/admin/all`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setReceipts(data);
            }
        } catch (err) {
            console.error('Failed to fetch receipts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig = {
        approved: {
            label: 'อนุมัติ',
            color: 'bg-green-100 text-green-800 border-green-300',
            icon: <CheckCircle size={16} className="text-green-600" />
        },
        pending: {
            label: 'รอตรวจสอบ',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            icon: <Clock size={16} className="text-yellow-600" />
        },
        rejected: {
            label: 'สละสิทธิ์',
            color: 'bg-red-100 text-red-800 border-red-300',
            icon: <XCircle size={16} className="text-red-600" />
        }
    };

    // ฟิลเตอร์ข้อมูล
    const filteredReceipts = receipts.filter(receipt => {
        const matchSearch = receipt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.phone.includes(searchTerm);
        const matchStatus = statusFilter === 'all' || receipt.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // จัดการ checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedReceipts(filteredReceipts.map(r => r.id));
        } else {
            setSelectedReceipts([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedReceipts(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // จัดการสถานะ
    const handleStatusChange = async (id, newStatus, note = '') => {
        try {
            const res = await fetch(`${API_BASE}/api/payments/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus, note })
            });
            if (res.ok) {
                setReceipts(prev => prev.map(r =>
                    r.id === id ? { ...r, status: newStatus, note } : r
                ));

                // Refresh data after status change to sync with dashboard
                setTimeout(() => fetchReceipts(), 300);

                // Show success message
                if (newStatus === 'approved') {
                    console.log('✅ Payment approved - user status updated to "success"');
                } else if (newStatus === 'rejected') {
                    console.log('❌ Payment rejected - user status updated to "declined"');
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    // ฟังก์ชัน refresh
    const refreshData = async () => {
        setIsRefreshing(true);
        await fetchReceipts();
        setSelectedReceipts([]);
        setSearchTerm('');
        setStatusFilter('all');
        setIsRefreshing(false);
    };

    // ดาวน์โหลดสลิป
    const downloadSlip = (slipImage, userName) => {
        const link = document.createElement('a');
        link.href = slipImage;
        link.download = `slip_${userName}.jpg`;
        link.click();
    };

    // Delete a receipt
    const deleteReceipt = async (id, userName = '') => {
        // Ask whether to delete only slip or both user + slip
        const removeUser = confirm('ต้องการลบชื่อผู้สมัครพร้อมสลิปหรือไม่?\n\nกด OK = ลบทั้งชื่อและสลิป, กด Cancel = ลบเฉพาะสลิป');
        if (!confirm('ยืนยันการลบสลิปนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;

        try {
            const url = `${API_BASE}/api/payments/${id}${removeUser ? '?removeUser=true' : ''}`;
            const res = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                // Remove from local state first for immediate UI update
                setReceipts(prev => prev.filter(r => r.id !== id));
                setSelectedReceipts(prev => prev.filter(i => i !== id));

                // Refresh data from server to ensure consistency
                setTimeout(() => fetchReceipts(), 500);

                if (data.userDeleted) {
                    alert(`ลบชื่อและสลิปของ ${userName || ''} เรียบร้อย`);
                } else {
                    alert('ลบสลิปเรียบร้อย');
                }
            } else {
                alert(data.error || data.message || 'ลบสลิปไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Failed to delete receipt:', err);
            alert('เกิดข้อผิดพลาดในการลบสลิป');
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">ตรวจสอบสลิปการชำระเงิน</h1>
                            <p className="text-gray-600">ทั้งหมด {receipts.length} รายการ | กำลังแสดง {filteredReceipts.length} รายการ</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}

                <div className="mt-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
                            <CheckCircle size={16} />
                            อนุมัติแล้ว
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                            {receipts.filter(r => r.status === 'approved').length} รายการ
                        </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium mb-1">
                            <Clock size={16} />
                            รอตรวจสอบ
                        </div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {receipts.filter(r => r.status === 'pending').length} รายการ
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
                            <XCircle size={16} />
                            สละสิทธิ์
                        </div>
                        <div className="text-2xl font-bold text-red-900">
                            {receipts.filter(r => r.status === 'rejected').length} รายการ
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
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
                                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer min-w-[180px]"
                            >
                                <option value="all">สถานะทั้งหมด</option>
                                <option value="pending">รอตรวจสอบ</option>
                                <option value="approved">อนุมัติแล้ว</option>
                                <option value="rejected">สละสิทธิ์</option>
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
                        {/* Export CSV Button */}
                        <button
                            onClick={async () => {
                                try {
                                    console.log('🔄 Starting CSV export...');

                                    // Fetch users data
                                    const usersRes = await fetch(`${API_BASE}/api/users/all`, {
                                        credentials: 'include'
                                    });

                                    console.log('📡 Users API response status:', usersRes.status);

                                    if (!usersRes.ok) {
                                        const errorText = await usersRes.text();
                                        console.error('❌ API Error:', errorText);
                                        throw new Error(`Failed to fetch users: ${usersRes.status}`);
                                    }

                                    const usersData = await usersRes.json();
                                    console.log('✅ Users data received:', usersData.length, 'users');

                                    // Create map: email/phone -> user data
                                    const userMap = {};
                                    usersData.forEach(user => {
                                        const key = user.email || user.phone;
                                        if (key) {
                                            userMap[key] = {
                                                regDate: user.createdAt || user.created_at || '',
                                            };
                                        }
                                    });

                                    console.log('📊 User map created with', Object.keys(userMap).length, 'entries');

                                    // Helper: Format date only (DD/MM/YYYY)
                                    const formatDateOnly = (dateStr) => {
                                        if (!dateStr) return '';
                                        try {
                                            const d = new Date(dateStr);
                                            return d.toLocaleDateString('th-TH', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            });
                                        } catch {
                                            return '';
                                        }
                                    };

                                    // Helper: Format date with time
                                    const formatDateWithTime = (dateStr) => {
                                        if (!dateStr) return '';
                                        try {
                                            const d = new Date(dateStr);
                                            return d.toLocaleString('th-TH', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            });
                                        } catch {
                                            return '';
                                        }
                                    };

                                    // Helper: Calculate deadline (+5 days)
                                    const calcDeadline = (regDateStr) => {
                                        if (!regDateStr) return '';
                                        try {
                                            const d = new Date(regDateStr);
                                            d.setDate(d.getDate() + 5);
                                            return formatDateOnly(d);
                                        } catch {
                                            return '';
                                        }
                                    };

                                    // Build CSV rows
                                    const headers = [
                                        'ลำดับ',
                                        'ชื่อ-นามสกุล',
                                        'อีเมล',
                                        'เบอร์โทร',
                                        'วันที่สมัคร',
                                        'วันที่ครบกำหนดชำระ',
                                        'วันเวลาที่อัปโหลดสลิป',
                                        'สถานะ',
                                        'หมายเหตุ'
                                    ];

                                    const rows = filteredReceipts.map((receipt, idx) => {
                                        const key = receipt.email || receipt.phone;
                                        const userData = userMap[key] || {};
                                        const regDate = userData.regDate || '';

                                        return [
                                            idx + 1,
                                            receipt.userName || '',
                                            receipt.email || '',
                                            receipt.phone || '',
                                            formatDateOnly(regDate),
                                            calcDeadline(regDate),
                                            formatDateWithTime(receipt.uploadDate),
                                            statusConfig[receipt.status]?.label || receipt.status,
                                            receipt.note || ''
                                        ];
                                    });

                                    // Convert to CSV string
                                    const csvLines = [
                                        headers.join(','),
                                        ...rows.map(row =>
                                            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
                                        )
                                    ];
                                    const csvContent = csvLines.join('\n');

                                    // Download
                                    const BOM = '\uFEFF';
                                    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `receipts_${new Date().toISOString().split('T')[0]}.csv`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);

                                } catch (error) {
                                    console.error('CSV Export Error:', error);
                                    alert('เกิดข้อผิดพลาดในการ export CSV: ' + error.message);
                                }
                            }}
                            className="cursor-pointer flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Download size={20} />
                            ส่งออก CSV
                        </button>
                    </div>

                    {/* Bulk Actions - Selected Items */}
                    {selectedReceipts.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-blue-800 font-medium">เลือกแล้ว {selectedReceipts.length} รายการ</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        selectedReceipts.forEach(id => handleStatusChange(id, 'approved'));
                                        setSelectedReceipts([]);
                                    }}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors "
                                >
                                    <CheckCircle size={16} />
                                    อนุมัติทั้งหมด
                                </button>
                                <button
                                    onClick={() => {
                                        selectedReceipts.forEach(id => handleStatusChange(id, 'pending'));
                                        setSelectedReceipts([]);
                                    }}
                                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Clock size={16} />
                                    รอตรวจสอบ
                                </button>
                                <button
                                    onClick={() => {
                                        selectedReceipts.forEach(id => handleStatusChange(id, 'rejected'));
                                        setSelectedReceipts([]);
                                    }}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <XCircle size={16} />
                                    สละสิทธิ์ทั้งหมด
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions - Update All Pending */}
                    {receipts.filter(r => r.status === 'pending').length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-purple-800 font-medium">
                                มี {receipts.filter(r => r.status === 'pending').length} รายการรอตรวจสอบ
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        receipts
                                            .filter(r => r.status === 'pending')
                                            .forEach(r => handleStatusChange(r.id, 'approved'));
                                    }}
                                    className="cursor-pointer  flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    title="อนุมัติสลิปรอตรวจสอบทั้งหมด"
                                >
                                    <CheckCircle size={16} />
                                    อนุมัติรอตรวจสอบทั้งหมด
                                </button>
                            </div>
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
                                            checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เบอร์โทร</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สลิป</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่อัพโหลด</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">หมายเหตุ</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReceipts.length === 0 ? (
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
                                    filteredReceipts.map((receipt, index) => (
                                        <tr
                                            key={receipt.id}
                                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedReceipts.includes(receipt.id)}
                                                    onChange={() => handleSelectOne(receipt.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{receipt.userName}</div>
                                                <div className="text-xs text-gray-500">{receipt.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{receipt.phone}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setViewingSlip(receipt)}
                                                    className="relative group cursor-pointer"
                                                >
                                                    <img
                                                        src={receipt.slipImage}
                                                        alt="สลิป"
                                                        className=" w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Image size={20} className="text-white" />
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(receipt.uploadDate).toLocaleString('th-TH')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={receipt.status}
                                                    onChange={(e) => handleStatusChange(receipt.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border ${statusConfig[receipt.status].color}`}
                                                >
                                                    <option value="pending">รอตรวจสอบ</option>
                                                    <option value="approved">อนุมัติ</option>
                                                    <option value="rejected">สละสิทธิ์</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                {receipt.note ? (
                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                        <AlertCircle size={14} />
                                                        {receipt.note}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setViewingSlip(receipt)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="ดูสลิป"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadSlip(receipt.slipImage, receipt.userName)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="ดาวน์โหลด"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteReceipt(receipt.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบสลิป"
                                                    >
                                                        <XCircle size={18} />
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

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-300 border-t-blue-600" />
                        <div className="text-gray-700">กำลังโหลดข้อมูล...</div>
                    </div>
                </div>
            )}

            {/* Modal แสดงสลิป */}
            {viewingSlip && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewingSlip(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingSlip(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                        >
                            ×
                        </button>

                        <h3 className="text-xl font-bold mb-4">รายละเอียดการชำระเงิน</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-sm text-gray-500">ชื่อ</div>
                                <div className="font-medium">{viewingSlip.userName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">เบอร์โทร</div>
                                <div className="font-medium">{viewingSlip.phone}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">วันที่อัพโหลด</div>
                                <div className="font-medium">
                                    {new Date(viewingSlip.uploadDate).toLocaleString('th-TH')}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">สถานะ</div>
                                <div className="flex items-center gap-2 mt-1">
                                    {statusConfig[viewingSlip.status].icon}
                                    <span className="font-medium">{statusConfig[viewingSlip.status].label}</span>
                                </div>
                            </div>
                        </div>

                        <img
                            src={viewingSlip.slipImage}
                            alt="สลิปการชำระเงิน"
                            className="w-full rounded-lg border-2 border-gray-200 mb-4"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    handleStatusChange(viewingSlip.id, 'approved', 'ตรวจสอบแล้ว ถูกต้อง');
                                    setViewingSlip(null);
                                }}
                                className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                                <CheckCircle size={20} />
                                อนุมัติ
                            </button>
                            <button
                                onClick={() => downloadSlip(viewingSlip.slipImage, viewingSlip.userName)}
                                className="cursor-pointer flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Receipts;
