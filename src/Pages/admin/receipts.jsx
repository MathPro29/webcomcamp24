import React, { useState } from 'react';
import { Search, Eye, Download, CheckCircle, XCircle, Clock, Filter, RefreshCcw, Image, AlertCircle } from 'lucide-react';
import Sidebar from '../../Components/Sidebar';

const Receipts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReceipts, setSelectedReceipts] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewingSlip, setViewingSlip] = useState(null);

    // ข้อมูลเริ่มต้น (จำลองจาก API) - เอา amount ออกเรียบร้อย
    const initialReceipts = [
        {
            id: 1,
            userId: 1,
            userName: 'สมชาย ใจดี',
            email: 'som@gmail.com',
            slipImage: 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400',
            uploadDate: '2024-11-15 14:30',
            status: 'pending',
            note: ''
        },
        {
            id: 2,
            userId: 2,
            userName: 'สมหญิง รักเรียน',
            email: 'somp@gmail.com',
            slipImage: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400',
            uploadDate: '2024-11-14 10:15',
            status: 'approved',
            note: 'ตรวจสอบแล้ว ถูกต้อง'
        },
        {
            id: 3,
            userId: 3,
            userName: 'ประยุทธ์ มานะ',
            email: 'prayut@gmail.com',
            slipImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400',
            uploadDate: '2024-11-13 16:45',
            status: 'approved',
            note: ''
        },
        {
            id: 4,
            userId: 4,
            userName: 'วิภา สดใส',
            email: 'wipa@gmail.com',
            slipImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
            uploadDate: '2024-11-12 09:20',
            status: 'rejected',
            note: 'จำนวนเงินไม่ถูกต้อง'
        },
        {
            id: 5,
            userId: 5,
            userName: 'ธนา เก่งกล้า',
            email: 'tana@gmail.com',
            slipImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
            uploadDate: '2024-11-15 11:00',
            status: 'pending',
            note: ''
        },
    ];

    const [receipts, setReceipts] = useState(initialReceipts);

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
            label: 'ปฏิเสธ', 
            color: 'bg-red-100 text-red-800 border-red-300', 
            icon: <XCircle size={16} className="text-red-600" /> 
        }
    };

    // ฟิลเตอร์ข้อมูล
    const filteredReceipts = receipts.filter(receipt => {
        const matchSearch = receipt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.id.toString().includes(searchTerm);
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
    const handleStatusChange = (id, newStatus, note = '') => {
        setReceipts(prev => prev.map(r => 
            r.id === id ? { ...r, status: newStatus, note } : r
        ));
    };

    // ฟังก์ชัน refresh
    const refreshData = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setReceipts([...initialReceipts]);
            setSelectedReceipts([]);
            setSearchTerm('');
            setStatusFilter('all');
            setIsRefreshing(false);
        }, 800);
    };

    // ดาวน์โหลดสลิป
    const downloadSlip = (slipImage, userName) => {
        const link = document.createElement('a');
        link.href = slipImage;
        link.download = `slip_${userName}.jpg`;
        link.click();
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
                            ปฏิเสธ
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
                                placeholder="ค้นหาชื่อ, อีเมล, หมายเลขใบเสร็จ..."
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
                    </div>

                    {/* Bulk Actions */}
                    {selectedReceipts.length > 0 && (
                        <div className="mt-4 flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="text-blue-800 font-medium">เลือกแล้ว {selectedReceipts.length} รายการ</span>
                            <button
                                onClick={() => {
                                    selectedReceipts.forEach(id => handleStatusChange(id, 'approved'));
                                    setSelectedReceipts([]);
                                }}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <CheckCircle size={16} />
                                อนุมัติทั้งหมด
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
                                            checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เลขที่</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ผู้ชำระ</th>
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
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{receipt.id.toString().padStart(4, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{receipt.userName}</div>
                                                <div className="text-xs text-gray-500">{receipt.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setViewingSlip(receipt)}
                                                    className="relative group"
                                                >
                                                    <img 
                                                        src={receipt.slipImage} 
                                                        alt="สลิป" 
                                                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Image size={20} className="text-white" />
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{receipt.uploadDate}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={receipt.status}
                                                    onChange={(e) => handleStatusChange(receipt.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border ${statusConfig[receipt.status].color}`}
                                                >
                                                    <option value="pending">รอตรวจสอบ</option>
                                                    <option value="approved">อนุมัติ</option>
                                                    <option value="rejected">ปฏิเสธ</option>
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
                                <div className="text-sm text-gray-500">ผู้ชำระ</div>
                                <div className="font-medium">{viewingSlip.userName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">วันที่อัพโหลด</div>
                                <div className="font-medium">{viewingSlip.uploadDate}</div>
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
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                                <CheckCircle size={20} />
                                อนุมัติ
                            </button>
                            <button
                                onClick={() => {
                                    const reason = prompt('กรุณาระบุเหตุผล:');
                                    if (reason) {
                                        handleStatusChange(viewingSlip.id, 'rejected', reason);
                                        setViewingSlip(null);
                                    }
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                                <XCircle size={20} />
                                ปฏิเสธ
                            </button>
                            <button
                                onClick={() => downloadSlip(viewingSlip.slipImage, viewingSlip.userName)}
                                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors"
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
