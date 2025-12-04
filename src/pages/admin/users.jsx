import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Filter, Download, UserPlus, RefreshCcw, CheckCircle, XCircle, Clock, User, Image, AlertCircle } from 'lucide-react';

export default function UnifiedUsersReceipts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingSlip, setViewingSlip] = useState(null);
  const [users, setUsers] = useState([]);

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch users
      const usersRes = await fetch(`${API_BASE}/api/users/all`);
      if (!usersRes.ok) {
        throw new Error(`HTTP ${usersRes.status}: Failed to fetch users`);
      }
      const usersData = await usersRes.json();

      // ✅ เพิ่ม validation
      if (!Array.isArray(usersData)) {
        console.error("❌ usersData is not an array:", usersData);
        throw new Error("Invalid users data format");
      }

      // Fetch receipts
      const receiptsRes = await fetch(`${API_BASE}/api/payments/admin/all`, {
        credentials: 'include'
      });
      if (!receiptsRes.ok) {
        throw new Error(`HTTP ${receiptsRes.status}: Failed to fetch receipts`);
      }
      const receiptsData = await receiptsRes.json();

      // ✅ เพิ่ม validation
      if (!Array.isArray(receiptsData)) {
        console.error("❌ receiptsData is not an array:", receiptsData);
        throw new Error("Invalid receipts data format");
      }

      // Merge data - match receipts with users by email or phone
      const merged = usersData.map(u => {
        const receipt = receiptsData.find(r =>
          r.email === u.email || r.phone === u.phone
        );

        return {
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email || '-',
          phone: u.phone || '-',
          school: u.school || '-',
          status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending',
          receipt: receipt ? {
            id: receipt.id,
            slipImage: receipt.slipImage,
            uploadDate: receipt.uploadDate,
            status: receipt.status,
            note: receipt.note
          } : null
        };
      });

      setUsers(merged);
      console.log(`✅ Successfully loaded ${merged.length} users`);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFullUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const fullUser = await res.json();
        fullUser.status = fullUser.status === 'success' ? 'approved' : fullUser.status === 'declined' ? 'rejected' : 'pending';
        return fullUser;
      }
    } catch (err) {
      console.error('Failed to fetch full user:', err);
    }
    return null;
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
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

  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchSearch && matchStatus;
  });

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

  const handleStatusChange = async (userId, newStatus) => {
    const statusMap = { approved: 'success', pending: 'pending', rejected: 'declined' };
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: statusMap[newStatus] })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        if (viewingUser && viewingUser._id === userId) {
          setViewingUser(prev => ({ ...prev, status: newStatus }));
        }

        // Also update receipt status if exists
        const user = users.find(u => u.id === userId);
        if (user?.receipt) {
          await fetch(`${API_BASE}/api/payments/${user.receipt.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
          });
        }

        setTimeout(() => fetchData(), 300);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('คุณต้องการลบผู้สมัครนี้ใช่หรือไม่?')) {
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
    if (confirm(`คุณต้องการลบผู้สมัคร ${selectedUsers.length} คนใช่หรือไม่?`)) {
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

  const deleteReceipt = async (receiptId, userId) => {
    const removeUser = confirm('ต้องการลบชื่อผู้สมัครพร้อมสลิปหรือไม่?\n\nกด OK = ลบทั้งชื่อและสลิป, กด Cancel = ลบเฉพาะสลิป');
    if (!confirm('ยืนยันการลบสลิปนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;

    try {
      const url = `${API_BASE}/api/payments/${receiptId}${removeUser ? '?removeUser=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.userDeleted) {
          setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, receipt: null } : u));
        }
        setTimeout(() => fetchData(), 500);
        alert(data.userDeleted ? 'ลบชื่อและสลิปเรียบร้อย' : 'ลบสลิปเรียบร้อย');
      } else {
        alert(data.error || data.message || 'ลบสลิปไม่สำเร็จ');
      }
    } catch (err) {
      console.error('Failed to delete receipt:', err);
      alert('เกิดข้อผิดพลาดในการลบสลิป');
    }
  };

  const downloadSlip = (slipImage, userName) => {
    const link = document.createElement('a');
    link.href = slipImage;
    link.download = `slip_${userName}.jpg`;
    link.click();
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'ชื่อ', 'อีเมล', 'เบอร์โทร', 'โรงเรียน', 'สถานะ', 'มีสลิป', 'สถานะสลิป'],
      ...filteredUsers.map(u => [
        u.id,
        u.name,
        u.email,
        u.phone,
        u.school,
        statusConfig[u.status].label,
        u.receipt ? 'มี' : 'ไม่มี',
        u.receipt ? statusConfig[u.receipt.status].label : '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users_receipts_export.csv';
    link.click();
  };

  const openUserModal = async (user) => {
    const fullUser = await fetchFullUser(user.id);
    if (fullUser) {
      fullUser.receipt = user.receipt;
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

  const usersWithReceipts = users.filter(u => u.receipt).length;
  const usersWithoutReceipts = users.length - usersWithReceipts;
  const pendingReceipts = users.filter(u => u.receipt?.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการผู้สมัครและตรวจสอบสลิป</h1>
              <p className="text-gray-600">ทั้งหมด {users.length} คน | กำลังแสดง {filteredUsers.length} คน</p>
            </div>
            <button className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md">
              <UserPlus size={20} />
              เพิ่มผู้ใช้ใหม่
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
              <CheckCircle size={16} />
              อนุมัติแล้ว
            </div>
            <div className="text-2xl font-bold text-green-900">
              {users.filter(u => u.status === 'approved').length} คน
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium mb-1">
              <Clock size={16} />
              รอตรวจสอบ
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {users.filter(u => u.status === 'pending').length} คน
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
              <XCircle size={16} />
              ปฏิเสธ
            </div>
            <div className="text-2xl font-bold text-red-900">
              {users.filter(u => u.status === 'rejected').length} คน
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
              <Image size={16} />
              มีสลิป
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {usersWithReceipts} คน
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-800 text-sm font-medium mb-1">
              <AlertCircle size={16} />
              สลิปรอตรวจ
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {pendingReceipts} รายการ
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
                placeholder="ค้นหาชื่อ, อีเมล, โรงเรียน, เบอร์โทร..."
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
                <option value="approved">อนุมัติแล้ว</option>
                <option value="pending">รอตรวจสอบ</option>
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
            <div className="mt-4 flex flex-wrap items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-800 font-medium">เลือกแล้ว {selectedUsers.length} คน</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    selectedUsers.forEach(id => handleStatusChange(id, 'approved'));
                    setSelectedUsers([]);
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle size={16} />
                  อนุมัติทั้งหมด
                </button>
                <button
                  onClick={() => {
                    selectedUsers.forEach(id => handleStatusChange(id, 'rejected'));
                    setSelectedUsers([]);
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle size={16} />
                  ปฏิเสธทั้งหมด
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  ลบที่เลือก
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions - Pending Receipts */}
          {pendingReceipts > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-purple-800 font-medium">
                มี {pendingReceipts} รายการสลิปรอตรวจสอบ
              </span>
              <button
                onClick={() => {
                  users
                    .filter(u => u.receipt?.status === 'pending')
                    .forEach(u => handleStatusChange(u.id, 'approved'));
                }}
                className="cursor-pointer flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle size={16} />
                อนุมัติสลิปรอตรวจทั้งหมด
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เบอร์โทร</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">โรงเรียน</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สลิป</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.school}</td>
                      <td className="px-6 py-4">
                        {user.receipt ? (
                          <button
                            onClick={() => setViewingSlip({ ...user.receipt, userName: user.name, userId: user.id })}
                            className="relative group cursor-pointer"
                          >
                            <img
                              src={user.receipt.slipImage}
                              alt="สลิป"
                              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Image size={20} className="text-white" />
                            </div>
                            {user.receipt.status === 'pending' && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <XCircle size={14} />
                            ไม่มีสลิป
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border ${statusConfig[user.status].color}`}
                        >
                          <option value="approved">อนุมัติแล้ว</option>
                          <option value="pending">รอตรวจสอบ</option>
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
                          {user.receipt && (
                            <>
                              <button
                                onClick={() => downloadSlip(user.receipt.slipImage, user.name)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="ดาวน์โหลดสลิป"
                              >
                                <Download size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบผู้สมัคร"
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

            <h3 className="text-xl font-bold mb-4">รายละเอียดผู้สมัคร</h3>

            {/* User Details */}
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
            </div>

            {/* Receipt Section */}
            {viewingUser.receipt && (
              <div className="border-t pt-4">
                <h4 className="text-lg font-bold mb-3">ข้อมูลสลิปการชำระเงิน</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">วันที่อัพโหลด</div>
                    <div className="font-medium">
                      {new Date(viewingUser.receipt.uploadDate).toLocaleString('th-TH')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">สถานะสลิป</div>
                    <div className="flex items-center gap-2 mt-1">
                      {statusConfig[viewingUser.receipt.status]?.icon}
                      <span className="font-medium">{statusConfig[viewingUser.receipt.status]?.label}</span>
                    </div>
                  </div>
                  {viewingUser.receipt.note && (
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">หมายเหตุ</div>
                      <div className="font-medium flex items-center gap-1">
                        <AlertCircle size={14} />
                        {viewingUser.receipt.note}
                      </div>
                    </div>
                  )}
                </div>
                <img
                  src={viewingUser.receipt.slipImage}
                  alt="สลิปการชำระเงิน"
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadSlip(viewingUser.receipt.slipImage, viewingUser.firstName)}
                    className="cursor-pointer flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Download size={18} />
                    ดาวน์โหลดสลิป
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('ต้องการลบสลิปนี้?')) {
                        deleteReceipt(viewingUser.receipt.id, viewingUser._id);
                        setViewingUser(null);
                      }
                    }}
                    className="cursor-pointer flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={18} />
                    ลบสลิป
                  </button>
                </div>
              </div>
            )}
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
              className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            <h3 className="text-xl font-bold mb-4">รายละเอียดสลิปการชำระเงิน</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">ชื่อผู้สมัคร</div>
                <div className="font-medium">{viewingSlip.userName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">วันที่อัพโหลด</div>
                <div className="font-medium">
                  {new Date(viewingSlip.uploadDate).toLocaleString('th-TH')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">สถานะสลิป</div>
                <div className="flex items-center gap-2 mt-1">
                  {statusConfig[viewingSlip.status]?.icon}
                  <span className="font-medium">{statusConfig[viewingSlip.status]?.label}</span>
                </div>
              </div>
              {viewingSlip.note && (
                <div>
                  <div className="text-sm text-gray-500">หมายเหตุ</div>
                  <div className="font-medium flex items-center gap-1">
                    <AlertCircle size={14} />
                    {viewingSlip.note}
                  </div>
                </div>
              )}
            </div>

            <img
              src={viewingSlip.slipImage}
              alt="สลิปการชำระเงิน"
              className="w-full rounded-lg border-2 border-gray-200 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleStatusChange(viewingSlip.userId, 'approved');
                  setViewingSlip(null);
                }}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <CheckCircle size={20} />
                อนุมัติ
              </button>
              <button
                onClick={() => {
                  handleStatusChange(viewingSlip.userId, 'rejected');
                  setViewingSlip(null);
                }}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <XCircle size={20} />
                ปฏิเสธ
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

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-300 border-t-blue-600" />
            <div className="text-gray-700">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      )}
    </div>
  );
}