import React, { useState, useEffect } from 'react';
import {
  Search, Eye, Download, CheckCircle, XCircle, Clock,
  RefreshCcw, Image, AlertCircle, DollarSign, Edit, Trash2, UserPlus
} from 'lucide-react';

export default function ApplicantManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingSlip, setViewingSlip] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/all`),
        fetch(`${API_BASE}/api/payments/admin/all`, { credentials: 'include' })
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const payments = paymentsRes.ok ? await paymentsRes.json() : [];

      const paymentMap = {};
      payments.forEach(p => { paymentMap[p.userId] = p; });

      const mapped = users.map(u => ({
        id: u._id,
        fullData: u,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email || '-',
        phone: u.phone || '-',
        school: u.school || '-',
        status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending',
        payment: paymentMap[u._id] || null
      }));

      setApplicants(mapped);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      alert('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  // อนุมัติทั้งสลิปและผู้สมัคร
  const approvePaymentAndUser = async (paymentId, userId) => {
    try {
      await Promise.all([
        fetch(`${API_BASE}/api/payments/${paymentId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'approved' })
        }),
        fetch(`${API_BASE}/api/users/${userId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'success' })
        })
      ]);

      setApplicants(prev => prev.map(a =>
        a.id === userId
          ? { ...a, status: 'approved', payment: a.payment ? { ...a.payment, status: 'approved' } : a.payment }
          : a
      ));
    } catch (err) {
      alert('อนุมัติไม่สำเร็จ');
    }
  };

  const rejectPayment = async (paymentId, note = 'สลิปไม่ถูกต้อง') => {
    try {
      await fetch(`${API_BASE}/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected', note })
      });

      setApplicants(prev => prev.map(a =>
        a.payment?.id === paymentId
          ? { ...a, payment: { ...a.payment, status: 'rejected', note } }
          : a
      ));
    } catch (err) {
      alert('ปฏิเสธไม่สำเร็จ');
    }
  };

  const deleteApplicantCompletely = async (userId, paymentId = null) => {
    if (!confirm('ยืนยันลบผู้สมัครนี้และข้อมูลทั้งหมด? (ไม่สามารถกู้คืนได้)')) return;

    try {
      const reqs = [fetch(`${API_BASE}/api/users/${userId}`, { method: 'DELETE', credentials: 'include' })];
      if (paymentId) reqs.push(fetch(`${API_BASE}/api/payments/${paymentId}`, { method: 'DELETE', credentials: 'include' }));
      await Promise.all(reqs);
      setApplicants(prev => prev.filter(a => a.id !== userId));
      alert('ลบเรียบร้อย');
    } catch (err) {
      alert('ลบไม่สำเร็จ');
    }
  };

  const approveAllPendingPayments = async () => {
    const pending = applicants.filter(a => a.payment?.status === 'pending');
    if (!pending.length || !confirm(`อนุมัติสลิปทั้งหมด ${pending.length} รายการ?`)) return;
    for (const a of pending) {
      await approvePaymentAndUser(a.payment.id, a.id);
    }
    alert('อนุมัติทั้งหมดเรียบร้อย!');
  };

  const exportCSV = () => {
    const headers = ['ชื่อ-สกุล', 'อีเมล', 'โรงเรียน', 'สถานะสมัคร', 'สถานะชำระเงิน', 'วันที่อัพโหลดสลิป'];
    const rows = applicants.map(a => [
      a.name,
      a.email,
      a.school,
      a.status === 'approved' ? 'อนุมัติ' : a.status === 'rejected' ? 'ปฏิเสธ' : 'รอ',
      a.payment ? (a.payment.status === 'approved' ? 'ชำระแล้ว' : a.payment.status === 'rejected' ? 'สลิปผิด' : 'รอตรวจสอบ') : 'ยังไม่ชำระ',
      a.payment ? new Date(a.payment.createdAt).toLocaleString('th-TH') : '-'
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applicants_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('th-TH') : '-';

  const statusConfig = {
    approved: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} /> },
    pending: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} /> },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800', icon: <XCircle size={16} /> }
  };

  const paymentStatusConfig = {
    approved: { label: 'ชำระแล้ว', color: 'bg-emerald-100 text-emerald-800', icon: <DollarSign size={16} /> },
    pending: { label: 'รอตรวจสลิป', color: 'bg-orange-100 text-orange-800', icon: <Clock size={16} /> },
    rejected: { label: 'สลิปผิด', color: 'bg-red-100 text-red-800', icon: <AlertCircle size={16} /> },
    none: { label: 'ยังไม่ชำระ', color: 'bg-gray-100 text-gray-600', icon: <UserPlus size={16} /> }
  };

  const filtered = applicants.filter(a => {
    const s = searchTerm.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s) || a.school.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const payStatus = a.payment ? a.payment.status : 'none';
    const matchPayment = paymentFilter === 'all' || payStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">จัดการผู้สมัครและการชำระเงิน</h1>
              <p className="text-gray-600 mt-2">ทั้งหมด {applicants.length} คน • แสดง {filtered.length} คน</p>
            </div>
            <div className="flex gap-4">
              <button onClick={exportCSV} className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold shadow-md transition">
                <Download size={22} /> Export CSV
              </button>
              <button onClick={fetchAllData} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold shadow-md transition">
                <RefreshCcw size={22} className={isRefreshing ? 'animate-spin' : ''} /> รีเฟรช
              </button>
            </div>
          </div>
        </div>

        {/* อนุมัติทั้งหมด */}
        {applicants.some(a => a.payment?.status === 'pending') && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="text-purple-600" size={36} />
              <div>
                <div className="text-2xl font-bold text-purple-900">มีสลิปรอตรวจสอบ {applicants.filter(a => a.payment?.status === 'pending').length} รายการ</div>
              </div>
            </div>
            <button onClick={approveAllPendingPayments} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-xl transition transform hover:scale-105">
              <CheckCircle size={32} className="inline mr-2" /> อนุมัติทั้งหมด
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="ค้นหาชื่อ อีเมล โรงเรียน..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border rounded-xl text-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-6 py-4 border rounded-xl text-lg">
              <option value="all">สถานะสมัครทั้งหมด</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-6 py-4 border rounded-xl text-lg">
              <option value="all">การชำระเงินทั้งหมด</option>
              <option value="approved">ชำระแล้ว</option>
              <option value="pending">รอตรวจสลิป</option>
              <option value="rejected">สลิปผิด</option>
              <option value="none">ยังไม่ชำระ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  <th className="px-6 py-5 text-left">เลือก</th>
                  <th className="px-6 py-5 text-left">ชื่อ-สกุล</th>
                  <th className="px-6 py-5 text-left">โรงเรียน</th>
                  <th className="px-6 py-5 text-left">สถานะสมัคร</th>
                  <th className="px-6 py-5 text-left">การชำระเงิน</th>
                  <th className="px-6 py-5 text-left">สลิป</th>
                  <th className="px-6 py-5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(a => {
                  const payStatus = a.payment ? a.payment.status : 'none';
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5"><input type="checkbox" checked={selectedApplicants.includes(a.id)} onChange={() => setSelectedApplicants(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])} /></td>
                      <td className="px-6 py-5 font-semibold">{a.name}<br /><span className="text-sm text-gray-500">{a.email} • {a.phone}</span></td>
                      <td className="px-6 py-5">{a.school}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig[a.status].color}`}>
                          {statusConfig[a.status].icon} {statusConfig[a.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${paymentStatusConfig[payStatus].color}`}>
                          {paymentStatusConfig[payStatus].icon} {paymentStatusConfig[payStatus].label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {a.payment ? (
                          <button onClick={() => setViewingSlip({ ...a.payment, userName: a.name, phone: a.phone })}>
                            <img src={a.payment.slipImage} alt="สลิป" className="w-16 h-16 object-cover rounded-lg border hover:border-blue-500 transition" />
                          </button>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => setViewingUser(a.fullData)} className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition" title="ดูรายละเอียด"><Eye size={20} className="text-blue-700" /></button>
                          {a.payment && (
                            <>
                              <button onClick={() => setViewingSlip({ ...a.payment, userName: a.name, phone: a.phone })} className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition"><Image size={20} className="text-indigo-700" /></button>
                              <a href={a.payment.slipImage} download className="p-3 bg-green-100 hover:bg-green-200 rounded-xl transition"><Download size={20} className="text-green-700" /></a>
                              <button onClick={() => approvePaymentAndUser(a.payment.id, a.id)} className="p-3 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"><CheckCircle size={22} className="text-emerald-700" /></button>
                            </>
                          )}
                          <button onClick={() => deleteApplicantCompletely(a.id, a.payment?.id)} className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition"><Trash2 size={20} className="text-red-700" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal ดูรายละเอียดผู้สมัคร (สวย + ไม่เพี้ยน) */}
        {viewingUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewingUser(null)}>
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-10 shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 text-4xl text-gray-500 hover:text-gray-700">&times;</button>
              <h2 className="text-4xl font-bold text-center mb-10">รายละเอียดผู้สมัคร</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { label: 'คำนำหน้า', key: 'prefix' },
                  { label: 'ชื่อ', key: 'firstName' },
                  { label: 'นามสกุล', key: 'lastName' },
                  { label: 'ชื่อเล่น', key: 'nickname' },
                  { label: 'วันเกิด', key: 'birthDate', format: 'date' },
                  { label: 'อายุ', key: 'age' },
                  { label: 'เพศ', key: 'gender' },
                  { label: 'โรงเรียน', key: 'school' },
                  { label: 'ชั้น', key: 'grade' },
                  { label: 'จังหวัด', key: 'province' },
                  { label: 'เบอร์โทร', key: 'phone' },
                  { label: 'เบอร์ผู้ปกครอง', key: 'parentPhone' },
                  { label: 'อีเมล', key: 'email' },
                  { label: 'Line ID', key: 'lineId' },
                  { label: 'ขนาดเสื้อ', key: 'shirtSize' },
                  { label: 'แพ้อาหาร/ยา', key: 'allergies' },
                  { label: 'โรคประจำตัว', key: 'medicalConditions' },
                  { label: 'ผู้ติดต่อฉุกเฉิน', key: 'emergencyContact' },
                  { label: 'เบอร์ฉุกเฉิน', key: 'emergencyPhone' },
                  { label: 'มีแล็ปท็อป', key: 'laptop', transform: v => v === 'Yes' ? 'มี' : v === 'No' ? 'ไม่มี' : '-' },
                  { label: 'วันที่สมัคร', key: 'createdAt', format: 'date' },
                ].map((f, i) => {
                  let val = viewingUser[f.key] || '-';
                  if (f.format === 'date' && val !== '-') val = new Date(val).toLocaleString('th-TH');
                  if (f.transform) val = f.transform(val);
                  return (
                    <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                      <div className="text-indigo-700 font-semibold">{f.label}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-2">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

                {/* Modal สลิปการชำระเงิน */}
        {viewingSlip && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setViewingSlip(null)}>
            <div className="bg-white rounded-3xl max-w-2xl w-full p-10 relative shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* ปุ่มปิด */}
              <button 
                onClick={() => setViewingSlip(null)} 
                className="absolute top-6 right-6 text-5xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center transition"
              >
                ×
              </button>

              <h3 className="text-4xl font-bold text-center mb-10 text-gray-800">สลิปการชำระเงิน</h3>

              <div className="text-center mb-10">
                <div className="text-3xl font-bold text-gray-900">{viewingSlip.userName}</div>
                <div className="text-xl text-gray-600 mt-2">{viewingSlip.phone}</div>
                <div className="text-lg text-gray-500 mt-4">
                  {formatDate(viewingSlip.createdAt)}
                </div>
              </div>

              <div className="flex justify-center mb-12">
                <img 
                  src={viewingSlip.slipImage} 
                  alt="สลิป" 
                  className="max-w-full max-h-96 rounded-2xl border-8 border-gray-200 shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <button
                  onClick={() => {
                    const userId = viewingSlip.userId || applicants.find(a => a.payment?.id === viewingSlip.id)?.id;
                    approvePaymentAndUser(viewingSlip.id, userId);
                    setViewingSlip(null);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-8 rounded-2xl font-bold text-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-4"
                >
                  <CheckCircle size={48} />
                  อนุมัติและเปิดสถานะ
                </button>

                <button
                  onClick={() => {
                    rejectPayment(viewingSlip.id, 'สลิปไม่ถูกต้องหรือข้อมูลไม่ครบถ้วน');
                    setViewingSlip(null);
                  }}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-8 rounded-2xl font-bold text-2xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-4"
                >
                  <XCircle size={48} />
                  ปฏิเสธสลิป
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-3xl shadow-2xl flex items-center gap-6">
              <div className="animate-spin rounded-full h-16 w-16 border-8 border-blue-600 border-t-transparent"></div>
              <span className="text-2xl font-bold">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}