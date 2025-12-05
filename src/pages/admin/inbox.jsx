import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, CheckCircle, XCircle, Settings, 
  AlertCircle, Lock, Unlock, Save, BarChart3
} from 'lucide-react';

const Inboxpage = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [tempCapacity, setTempCapacity] = useState(100);
  const [currentRegistrations, setCurrentRegistrations] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:5000';

  // Fetch current stats and settings
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch settings
      const settingsRes = await fetch(`${API_BASE}/api/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setIsRegistrationOpen(settingsData.isRegistrationOpen);
        setMaxCapacity(settingsData.maxCapacity);
        setTempCapacity(settingsData.maxCapacity);
        setLastUpdated(new Date(settingsData.lastUpdated));
      }

      // Fetch user stats
      const usersRes = await fetch(`${API_BASE}/api/users/all`);
      if (usersRes.ok) {
        const users = await usersRes.json();
        const pending = users.filter(u => u.status === 'pending').length;
        const approved = users.filter(u => u.status === 'success' || u.status === 'approved').length;
        const rejected = users.filter(u => u.status === 'declined' || u.status === 'rejected').length;
        
        setStats({
          pending,
          approved,
          rejected,
          total: users.length
        });
        setCurrentRegistrations(users.length);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    try {
      const newStatus = !isRegistrationOpen;
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isRegistrationOpen: newStatus })
      });

      if (res.ok) {
        setIsRegistrationOpen(newStatus);
        setLastUpdated(new Date());
      } else {
        alert('ไม่สามารถเปลี่ยนสถานะได้ กรุณาเข้าสู่ระบบก่อน');
      }
    } catch (err) {
      console.error('Error toggling registration:', err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleSaveCapacity = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ maxCapacity: tempCapacity })
      });

      if (res.ok) {
        setMaxCapacity(tempCapacity);
        setLastUpdated(new Date());
        alert('บันทึกสำเร็จ');
      } else {
        alert('ไม่สามารถบันทึกได้ กรุณาเข้าสู่ระบบก่อน');
      }
    } catch (err) {
      console.error('Error saving capacity:', err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  const remainingSeats = maxCapacity - currentRegistrations;
  const capacityPercentage = (currentRegistrations / maxCapacity) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Settings className="text-blue-600" size={32} />
                ควบคุมฟอร์มลงทะเบียน
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Clock size={16} />
                อัพเดทล่าสุด: {lastUpdated.toLocaleString('th-TH')}
              </p>
            </div>
            
            {/* Registration Toggle */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-xl border-2 border-blue-200">
              <div className="text-right">
                <div className="text-sm text-gray-600 font-medium">สถานะการรับสมัคร</div>
                <div className={`text-lg font-bold ${isRegistrationOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {isRegistrationOpen ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
                </div>
              </div>
              <button
                onClick={handleToggleRegistration}
                className={`cursor-pointer relative w-16 h-8 rounded-full transition-all duration-300 ${
                  isRegistrationOpen ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                    isRegistrationOpen ? 'translate-x-8' : 'translate-x-0'
                  }`}
                >
                  {isRegistrationOpen ? (
                    <Unlock size={14} className="text-green-600" />
                  ) : (
                    <Lock size={14} className="text-red-600" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Registrations */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <Users size={24} className="opacity-80" />
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                ทั้งหมด
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-blue-100 text-sm">ผู้สมัครทั้งหมด</div>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <Clock size={24} className="opacity-80" />
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                รอตรวจ
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pending}</div>
            <div className="text-yellow-100 text-sm">รอการตรวจสอบ</div>
          </div>

          {/* Approved */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={24} className="opacity-80" />
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                อนุมัติ
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.approved}</div>
            <div className="text-green-100 text-sm">อนุมัติแล้ว</div>
          </div>

          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <XCircle size={24} className="opacity-80" />
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                ปฏิเสธ
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.rejected}</div>
            <div className="text-red-100 text-sm">ถูกปฏิเสธ</div>
          </div>
        </div>

        {/* Capacity Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-purple-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">จัดการจำนวนที่รับ</h2>
          </div>

          {/* Capacity Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">ความจุปัจจุบัน</span>
              <span className="text-sm font-bold text-gray-800">
                {currentRegistrations} / {maxCapacity} คน ({capacityPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercentage >= 100
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : capacityPercentage >= 80
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Remaining Seats Alert */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            remainingSeats <= 0
              ? 'bg-red-50 border-red-200'
              : remainingSeats <= 20
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle
                size={24}
                className={
                  remainingSeats <= 0
                    ? 'text-red-600'
                    : remainingSeats <= 20
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }
              />
              <div>
                <div className="font-bold text-gray-800">
                  {remainingSeats <= 0
                    ? 'เต็มแล้ว!'
                    : remainingSeats <= 20
                    ? 'ใกล้เต็มแล้ว!'
                    : 'ยังมีที่นั่งเหลือ'}
                </div>
                <div className="text-sm text-gray-600">
                  เหลือที่นั่ง: <span className="font-bold">{Math.max(remainingSeats, 0)}</span> ที่
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Input */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ตั้งค่าจำนวนที่รับสูงสุด
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={tempCapacity}
                  onChange={(e) => setTempCapacity(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-semibold"
                  placeholder="จำนวนที่รับ"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  คน
                </div>
              </div>
              <button
                onClick={handleSaveCapacity}
                disabled={isSaving || tempCapacity === maxCapacity}
                className="cursor-pointer px-6 py-3 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Save size={20} />
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
            {tempCapacity !== maxCapacity && (
              <div className="mt-3 text-sm text-blue-600 font-medium">
                * การเปลี่ยนแปลงจะมีผลทันทีหลังกดบันทึก
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inboxpage;