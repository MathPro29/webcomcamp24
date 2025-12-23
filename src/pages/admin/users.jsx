// users.jsx
import React, { useState, useEffect } from 'react';
import {
  Search, Edit2, Trash2, Eye, Filter, Download, RefreshCcw,
  CheckCircle, XCircle, Clock, Image, AlertCircle, Upload, StickyNote
} from 'lucide-react';
import { notify } from '../../utils/toast.js';

/* ---------------------------
   Top-level small components
   - ModalWrapper & FieldRow are defined at top-level
   so EditUserModal and ViewUserModal can use them.
   --------------------------- */
function ModalWrapper({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={() => onClose?.()}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onClose?.()}
          className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, value, editingValue, onChange, type = 'text', textarea = false, options = null }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      {(!editingValue && !onChange) ? (
        <div className="font-medium">{value ?? '-'}</div>
      ) : textarea ? (
        <textarea
          value={editingValue ?? value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      ) : options ? (
        <select
          value={editingValue ?? value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={editingValue ?? value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      )}
    </div>
  );
}



/* ===========================
   UploadCertificateModal Component
   =========================== */
/* ===========================
   CertificateManagerModal Component
   =========================== */
function CertificateManagerModal({
  user,
  onClose,
  onUpdateSuccess,
  globalReleaseDate,
  globalReleaseTime,
  setGlobalReleaseDate,
  setGlobalReleaseTime
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(user.certificate ? 'view' : 'upload');

  // Use global state, but initialize from user's certificate if available and global is empty
  useEffect(() => {
    if (user.certificate?.releaseDate && !globalReleaseDate) {
      const certDate = new Date(user.certificate.releaseDate);
      // Use local date components to avoid timezone shift
      const year = certDate.getFullYear();
      const month = String(certDate.getMonth() + 1).padStart(2, '0');
      const day = String(certDate.getDate()).padStart(2, '0');
      const hours = String(certDate.getHours()).padStart(2, '0');
      const minutes = String(certDate.getMinutes()).padStart(2, '0');
      setGlobalReleaseDate(`${year}-${month}-${day}`);
      setGlobalReleaseTime(`${hours}:${minutes}`);
    } else if (!globalReleaseDate) {
      // Set default date to tomorrow if not set
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      setGlobalReleaseDate(`${year}-${month}-${day}`);
      setGlobalReleaseTime('09:00');
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !user.certificate) {
      notify.error('กรุณาเลือกไฟล์');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (file) formData.append('certificate', file);

    // Combine date and time - create local datetime and send as ISO string
    // This preserves the user's intended local time
    const combinedDateTime = `${globalReleaseDate}T${globalReleaseTime}:00`;
    formData.append('releaseDate', combinedDateTime);

    try {
      const API_BASE = 'https://comcamp.csmju.com';
      const res = await fetch(`${API_BASE}/api/users/${user.id}/certificate`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        notify.success('บันทึกข้อมูลเกียรติบัตรสำเร็จ');
        onUpdateSuccess(user.id, combinedDateTime, file ? file.name : user.certificate.filename);
        onClose();
      } else {
        const data = await res.json();
        notify.error(data.error || 'บันทึกล้มเหลว');
      }
    } catch (err) {
      console.error(err);
      notify.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCertificate = async () => {
    if (!confirm('คุณต้องการลบไฟล์เกียรติบัตรนี้ใช่หรือไม่?')) return;

    setUploading(true);
    try {
      const API_BASE = 'https://comcamp.csmju.com';
      const res = await fetch(`${API_BASE}/api/users/${user.id}/certificate`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        notify.success('ลบไฟล์เกียรติบัตรสำเร็จ');
        onUpdateSuccess(user.id, null, null);
        onClose();
      } else {
        const data = await res.json();
        notify.error(data.error || 'ลบไฟล์ล้มเหลว');
      }
    } catch (err) {
      console.error(err);
      notify.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">จัดการเกียรติบัตร</h3>
          <p className="text-sm text-gray-500 mt-1">
            สำหรับ: <span className="font-semibold text-gray-700">{user.name}</span>
          </p>
        </div>
        {user.certificate && (
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === 'view'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ดูข้อมูล
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                แก้ไข / อัพโหลดใหม่
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      {activeTab === 'view' && user.certificate ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            {/* Image Preview */}
            {user.certificate.mimeType && user.certificate.mimeType.startsWith('image/') ? (
              <div className="mb-6 w-full">
                <div className="relative group">
                  <img
                    src={`https://comcamp.csmju.com/api/users/${user.id}/certificate/download?view=true`}
                    alt="Certificate"
                    className="max-w-full max-h-[500px] object-contain mx-auto rounded-xl shadow-lg border border-gray-300 transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle size={40} />
              </div>
            )}

            {/* Upload Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 bg-white px-4 py-2 rounded-full shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>อัพโหลดเมื่อ: <span className="font-medium text-gray-700">{new Date(user.certificate.uploadedAt).toLocaleString('th-TH')}</span></span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href={`https://comcamp.csmju.com/api/users/${user.id}/certificate/download?view=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>ดู Preview</span>
              </a>
              <a
                href={`https://comcamp.csmju.com/api/users/${user.id}/certificate/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Download size={22} className="group-hover:animate-bounce" />
                <span>ดาวน์โหลด</span>
              </a>
              <button
                onClick={handleDeleteCertificate}
                disabled={uploading}
                className="group flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={22} />
                <span>ลบไฟล์</span>
              </button>
            </div>
          </div>

          {/* Release Date & Time Info */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">วันที่และเวลาเปิดให้ดาวน์โหลด:</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-lg">
                    {user.certificate.releaseDate
                      ? new Date(user.certificate.releaseDate).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                      : 'ยังไม่กำหนด'}
                  </div>
                  {user.certificate.releaseDate && (
                    <div className="text-sm text-gray-500 mt-1">
                      เวลา {new Date(user.certificate.releaseDate).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })} น.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-lg mb-1">อัพโหลดไฟล์ใหม่</h4>
                <p className="text-sm text-blue-700">การอัพโหลดจะแทนที่ไฟล์เดิมที่มีอยู่ (ถ้ามี)</p>
              </div>
            </div>
          </div>

          {/* Combined File Upload and Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ไฟล์เกียรติบัตร (PDF หรือ รูปภาพ)
            </label>

            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="cursor-pointer block w-full text-sm text-gray-600
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white
                  hover:file:from-blue-600 hover:file:to-blue-700
                  file:shadow-md hover:file:shadow-lg
                  file:transition-all file:duration-300 file:cursor-pointer"
              />

              {/* Current Certificate Preview */}
              {user.certificate && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">ไฟล์ปัจจุบัน</p>
                        <p className="text-xs text-gray-500">{user.certificate.filename || 'certificate'} ({(user.certificate.fileSize / 1024).toFixed(1)} KB)</p>
                      </div>
                    </div>
                    <a
                      href={`https://comcamp.csmju.com/api/users/${user.id}/certificate/download?view=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      เปิดดู
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Release Date & Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              วันที่และเวลาที่ปล่อยให้ดาวน์โหลด
            </label>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">ตั้งวันที่</label>
                <input
                  type="date"
                  value={globalReleaseDate}
                  onChange={(e) => setGlobalReleaseDate(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                />
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">ตั้งเวลา</label>
                <div className="flex gap-2">
                  {/* ชั่วโมง */}
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={parseInt(globalReleaseTime.split(':')[0], 10)}
                    onChange={(e) => {
                      let hour = parseInt(e.target.value, 10);
                      if (isNaN(hour)) hour = 0;
                      if (hour > 23) hour = 23;
                      if (hour < 0) hour = 0;
                      setGlobalReleaseTime(`${hour.toString().padStart(2, '0')}:${globalReleaseTime.split(':')[1]}`);
                    }}
                    onWheel={(e) => e.target.blur()} // ป้องกัน scroll
                    className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="ชม."
                  />

                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={parseInt(globalReleaseTime.split(':')[1], 10)}
                    onChange={(e) => {
                      let minute = parseInt(e.target.value, 10);
                      if (isNaN(minute)) minute = 0;
                      if (minute > 59) minute = 59;
                      if (minute < 0) minute = 0;
                      setGlobalReleaseTime(`${globalReleaseTime.split(':')[0]}:${minute.toString().padStart(2, '0')}`);
                    }}
                    onWheel={(e) => e.target.blur()} // ป้องกัน scroll
                    className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="นาที"
                  />

                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:hover:translate-y-0 cursor-pointer"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกข้อมูล'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ===========================
   Main component
   =========================== */
export default function UnifiedUsersReceipts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewingUser, setViewingUser] = useState(null); // view-only modal
  const [viewingSlip, setViewingSlip] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // edit modal
  const [uploadingUser, setUploadingUser] = useState(null); // upload cert modal
  const [saving, setSaving] = useState(false);

  // Global certificate release date/time - shared across all certificate modals
  const [globalReleaseDate, setGlobalReleaseDate] = useState('');
  const [globalReleaseTime, setGlobalReleaseTime] = useState('09:00');

  const [users, setUsers] = useState([]);

  const API_BASE = 'https://comcamp.csmju.com';

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------- Fetch / Data ---------- */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersRes, receiptsRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/all`),
        fetch(`${API_BASE}/api/payments/admin/all`, { credentials: 'include' })
      ]);

      if (!usersRes.ok) throw new Error(`Users fetch failed (${usersRes.status})`);
      if (!receiptsRes.ok) throw new Error(`Receipts fetch failed (${receiptsRes.status})`);

      const usersData = await usersRes.json();
      const receiptsData = await receiptsRes.json();

      if (!Array.isArray(usersData) || !Array.isArray(receiptsData)) {
        throw new Error('Invalid data format received from server');
      }

      // Merge users + receipts (match by email or phone)
      const merged = usersData.map(u => {
        const receipt = receiptsData.find(r => r.email === u.email || r.phone === u.phone);
        return {
          id: u._id,
          _raw: u, // keep raw if needed
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email || '-',
          phone: u.phone || '-',
          school: u.school || '-',
          status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending',
          createdAt: u.createdAt || u.created_at, // วันเวลาที่สมัคร
          receipt: receipt ? {
            id: receipt.id,
            slipImage: receipt.slipImage,
            uploadDate: receipt.uploadDate,
            status: receipt.status,
            note: receipt.note
          } : null,
          certificate: u.certificate // Pass certificate info
        };
      });

      setUsers(merged);
    } catch (err) {
      console.error('fetchData error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
    setSelectedUsers([]);
    setSearchTerm('');
    setStatusFilter('all');
    setIsRefreshing(false);
  };

  /* ---------- Helper / Small UI parts ---------- */
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
      label: 'สละสิทธิ์',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle size={16} className="text-red-600" />
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  /* ---------- Fetch detailed user ---------- */
  const fetchFullUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { credentials: 'include' });
      if (!res.ok) {
        console.error('fetchFullUser failed', res.status);
        return null;
      }
      const fullUser = await res.json();
      // Map backend status to UI representation (if backend uses success/declined)
      fullUser.status = fullUser.status === 'success' ? 'approved' : fullUser.status === 'declined' ? 'rejected' : 'pending';
      return fullUser;
    } catch (err) {
      console.error('fetchFullUser error:', err);
      return null;
    }
  };

  /* ---------- Open modals ---------- */
  const openUserModal = async (user) => {
    const fullUser = await fetchFullUser(user.id);
    if (fullUser) {
      // Attach receipt if we had merged it previously
      fullUser.receipt = user.receipt ?? null;
      setViewingUser(fullUser);
    } else {
      alert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  };

  const handleEdit = async (id) => {
    const user = await fetchFullUser(id);
    if (user) {
      setEditingUser(user);
    } else {
      alert('ไม่สามารถโหลดข้อมูลผู้ใช้สำหรับแก้ไขได้');
    }
  };

  /* ---------- Actions ---------- */
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
        // Update local list fast
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        if (viewingUser && viewingUser._id === userId) {
          setViewingUser(prev => ({ ...prev, status: newStatus }));
        }
        // update receipt status too (best-effort)
        const user = users.find(u => u.id === userId);
        if (user?.receipt) {
          await fetch(`${API_BASE}/api/payments/${user.receipt.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
          });
        }
      } else {
        console.error('status change failed', res.status);
      }
    } catch (err) {
      console.error('handleStatusChange error', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบผู้สมัครนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setSelectedUsers(prev => prev.filter(i => i !== id));
        if (viewingUser && viewingUser._id === id) setViewingUser(null);
      } else {
        toast.error('ลบไม่สำเร็จ');
      }
    } catch (err) {
      console.error('delete error', err);
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const deleteReceipt = async (receiptId, userId) => {
    const removeUser = confirm('ต้องการลบชื่อผู้สมัครพร้อมสลิปหรือไม่?\n\nOK = ลบทั้งชื่อและสลิป, Cancel = ลบเฉพาะสลิป');
    if (!confirm('ยืนยันการลบสลิปนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      const url = `${API_BASE}/api/payments/${receiptId}${removeUser ? '?removeUser=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.userDeleted) setUsers(prev => prev.filter(u => u.id !== userId));
        else setUsers(prev => prev.map(u => u.id === userId ? { ...u, receipt: null } : u));
        setViewingUser(null);
        toast.success(data.userDeleted ? 'ลบชื่อและสลิปเรียบร้อย' : 'ลบสลิปเรียบร้อย');
      } else {
        toast.error(data.error || 'ลบสลิปไม่สำเร็จ');
      }
    } catch (err) {
      console.error('deleteReceipt error', err);
      toast.error('เกิดข้อผิดพลาดในการลบสลิป');
    }
  };

  const downloadSlip = (slipImage, userName) => {
    const link = document.createElement('a');
    link.href = slipImage;
    link.download = `slip_${userName}.jpg`;
    link.click();
  };

  /* Bulk delete */
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`คุณต้องการลบผู้สมัคร ${selectedUsers.length} คนใช่หรือไม่?`)) return;
    try {
      await Promise.all(selectedUsers.map(id => fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE', credentials: 'include' })));
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
    } catch (err) {
      console.error('bulk delete error', err);
    }
  };

  /* ---------- Edit Modal Save ---------- */
  const handleSaveEdit = async (updatedFields) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const id = editingUser._id ?? editingUser.id;
      // Normalize laptop to Yes/No (adjust if backend expects other)
      if (updatedFields.laptop !== undefined) {
        const lv = String(updatedFields.laptop).toLowerCase();
        updatedFields.laptop = (lv === 'yes' || lv === 'y') ? 'Yes' : (lv === 'no' || lv === 'n' ? 'No' : updatedFields.laptop);
      }

      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedFields)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Update failed');
      }

      const updated = await res.json();

      // Map backend status
      const mappedStatus = updated.status === 'success' ? 'approved' : updated.status === 'declined' ? 'rejected' : 'pending';

      // Update local users list (optimized)
      setUsers(prev => prev.map(u => u.id === (updated._id ?? updated.id) ? {
        ...u,
        name: `${updated.firstName || ''} ${updated.lastName || ''}`.trim(),
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email || u.email,
        phone: updated.phone || u.phone,
        school: updated.school || u.school,
        status: mappedStatus
      } : u));

      // Update viewingUser/editingUser
      setEditingUser(null);
      setViewingUser(prev => prev && (prev._id === updated._id || prev._id === updated.id) ? { ...prev, ...updated, status: mappedStatus } : prev);

      notify.success('บันทึกข้อมูลเรียบร้อย');
    } catch (err) {
      console.error('handleSaveEdit error', err);
      notify.error('เกิดข้อผิดพลาดในการบันทึก: ' + (err.message || 'Unknown'));
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Filtering / selection ---------- */
  const filteredUsers = users.filter(user => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch = !term || (
      (user.name || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      (user.school || '').toLowerCase().includes(term) ||
      (user.phone || '').includes(term)
    );
    const matchStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedUsers(filteredUsers.map(u => u.id));
    else setSelectedUsers([]);
  };

  const handleSelectOne = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const usersWithReceipts = users.filter(u => u.receipt).length;
  const pendingReceipts = users.filter(u => u.receipt?.status === 'pending').length;

  /* ---------- Render ---------- */
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
              สละสิทธิ์
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
                <option value="rejected">สละสิทธิ์</option>
              </select>
            </div>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="cursor-pointer flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 disabled:text-gray-400 px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
            </button>

            <button
              onClick={() => {
                // export CSV minimal (reuse previous logic simplified)
                const csvContent = [
                  ['ID', 'ชื่อ', 'อีเมล', 'เบอร์โทร', 'โรงเรียน', 'สถานะ', 'มีสลิป'],
                  ...filteredUsers.map(u => [u.id, u.name, u.email, u.phone, u.school, statusConfig[u.status].label, u.receipt ? 'มี' : 'ไม่มี'])
                ].map(r => r.join(',')).join('\n');

                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'users_receipts_export.csv';
                link.click();
              }}
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
                  onClick={() => { selectedUsers.forEach(id => handleStatusChange(id, 'approved')); setSelectedUsers([]); }}
                  className="cursor-pointer flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle size={16} />
                  อนุมัติทั้งหมด
                </button>
                <button
                  onClick={() => { selectedUsers.forEach(id => handleStatusChange(id, 'rejected')); setSelectedUsers([]); }}
                  className="cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle size={16} />
                  สละสิทธิ์ทั้งหมด
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="cursor-pointer flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  ลบที่เลือก
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
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
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
                          <button onClick={() => setViewingSlip({ ...user.receipt, userName: user.name, userId: user.id })} className="relative group cursor-pointer">
                            <img src={user.receipt.slipImage} alt="สลิป" className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Image size={20} className="text-white" />
                            </div>
                            {user.receipt.status === 'pending' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center gap-1"><XCircle size={14} /> ไม่มีสลิป</span>
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
                          <option value="rejected">สละสิทธิ์</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openUserModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ดูรายละเอียด">
                            <Eye size={18} />
                          </button>

                          {user.receipt && (
                            <button onClick={() => downloadSlip(user.receipt.slipImage, user.name)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="ดาวน์โหลดสลิป">
                              <Download size={18} />
                            </button>
                          )}

                          <button onClick={() => handleEdit(user.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                            <Edit2 size={18} />
                          </button>

                          <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบผู้สมัคร">
                            <Trash2 size={18} />
                          </button>

                          <button onClick={() => setUploadingUser(user)} className={`p-2 rounded-lg transition-colors ${user.certificate ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`} title={user.certificate ? "จัดการเกียรติบัตร" : "ยังไม่มีเกียรติบัตร"}>
                            {user.certificate ? <StickyNote size={18} /> : <StickyNote size={18} />}
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

      {/* View User Modal */}
      {viewingUser && (
        <ModalWrapper onClose={() => setViewingUser(null)}>
          <ViewUserModal
            viewingUser={viewingUser}
            setViewingUser={setViewingUser}
            deleteReceipt={deleteReceipt}
            downloadSlip={downloadSlip}
            statusConfig={statusConfig}
          />
        </ModalWrapper>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <ModalWrapper onClose={() => { if (!saving) setEditingUser(null); }}>
          <EditUserModal
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            onSave={handleSaveEdit}
            saving={saving}
          />
        </ModalWrapper>
      )}

      {/* Certificate Manager Modal */}
      {uploadingUser && (
        <ModalWrapper onClose={() => setUploadingUser(null)}>
          <CertificateManagerModal
            user={uploadingUser}
            onClose={() => setUploadingUser(null)}
            globalReleaseDate={globalReleaseDate}
            globalReleaseTime={globalReleaseTime}
            setGlobalReleaseDate={setGlobalReleaseDate}
            setGlobalReleaseTime={setGlobalReleaseTime}
            onUpdateSuccess={(userId, releaseDate, filename) => {
              setUsers(prev => prev.map(u => u.id === userId ? {
                ...u,
                certificate: filename ? {
                  ...u.certificate, // keep other fields if any
                  filename,
                  releaseDate,
                  uploadedAt: u.certificate?.uploadedAt || new Date() // preserve or new
                } : null // Set to null when file is deleted
              } : u));
            }}
          />
        </ModalWrapper>
      )}

      {/* View Slip Modal */}
      {viewingSlip && (
        <ModalWrapper onClose={() => setViewingSlip(null)}>
          <div>
            <h3 className="text-xl font-bold mb-4">รายละเอียดสลิปการชำระเงิน</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">ชื่อผู้สมัคร</div>
                <div className="font-medium">{viewingSlip.userName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">วันที่อัพโหลด</div>
                <div className="font-medium">{new Date(viewingSlip.uploadDate).toLocaleString('th-TH')}</div>
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
            <img src={viewingSlip.slipImage} alt="สลิปการชำระเงิน" className="w-full rounded-lg border-2 border-gray-200 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { handleStatusChange(viewingSlip.userId, 'approved'); setViewingSlip(null); }} className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                <CheckCircle size={20} /> อนุมัติ
              </button>
              <button onClick={() => { handleStatusChange(viewingSlip.userId, 'rejected'); setViewingSlip(null); }} className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                <XCircle size={20} /> สละสิทธิ์
              </button>
              <button onClick={() => downloadSlip(viewingSlip.slipImage, viewingSlip.userName)} className="cursor-pointer flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        </ModalWrapper>
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

/* ===========================
   ViewUserModal Component
   - read-only detail view (ใช้ viewingUser)
   =========================== */
function ViewUserModal({ viewingUser, setViewingUser, deleteReceipt, downloadSlip, statusConfig }) {
  const formatDateSafe = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('th-TH');
    } catch {
      return d;
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">รายละเอียดผู้สมัคร</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="col-span-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-semibold">วันเวลาที่สมัคร</div>
          <div className="font-bold text-lg text-blue-900">
            {viewingUser.createdAt || viewingUser.created_at ?
              new Date(viewingUser.createdAt || viewingUser.created_at).toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }) : '-'}
          </div>
        </div>
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
          <div className="font-medium">{formatDateSafe(viewingUser.birthDate)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">อายุ</div>
          <div className="font-medium">{viewingUser.age || '-'} ปี</div>
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
          <div className="font-medium">{String(viewingUser.laptop).toLowerCase() === 'yes' ? 'ใช่' : String(viewingUser.laptop).toLowerCase() === 'no' ? 'ไม่' : (viewingUser.laptop || '-')}</div>
        </div>
      </div>

      {/* Receipt Section */}
      {viewingUser.receipt && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-bold mb-3">ข้อมูลสลิปการชำระเงิน</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">วันที่อัพโหลด</div>
              <div className="font-medium">{new Date(viewingUser.receipt.uploadDate).toLocaleString('th-TH')}</div>
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

          <img src={viewingUser.receipt.slipImage} alt="สลิปการชำระเงิน" className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200 mb-4" />

          <div className="flex gap-2">
            <button onClick={() => downloadSlip(viewingUser.receipt.slipImage, viewingUser.firstName)} className="cursor-pointer flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Download size={18} /> ดาวน์โหลดสลิป
            </button>
            <button onClick={() => { if (confirm('ต้องการลบสลิปนี้?')) { deleteReceipt(viewingUser.receipt.id, viewingUser._id); setViewingUser(null); } }} className="cursor-pointer flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Trash2 size={18} /> ลบสลิป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================
   EditUserModal Component
   - editable form (ใช้ editingUser)
   - onSave(updatedFields) จะถูกเรียกเมื่อกดบันทึก
   =========================== */
function EditUserModal({ editingUser, setEditingUser, onSave, saving }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (editingUser) {
      setForm({
        prefix: editingUser.prefix || '',
        firstName: editingUser.firstName || '',
        lastName: editingUser.lastName || '',
        nickname: editingUser.nickname || '',
        birthDate: editingUser.birthDate ? editingUser.birthDate.split('T')[0] : '',
        age: editingUser.age ?? '',
        gender: editingUser.gender || '',
        school: editingUser.school || '',
        grade: editingUser.grade || '',
        province: editingUser.province || '',
        phone: editingUser.phone || '',
        parentPhone: editingUser.parentPhone || '',
        email: editingUser.email || '',
        lineId: editingUser.lineId || '',
        shirtSize: editingUser.shirtSize || '',
        allergies: editingUser.allergies || '',
        medicalConditions: editingUser.medicalConditions || '',
        emergencyContact: editingUser.emergencyContact || '',
        emergencyPhone: editingUser.emergencyPhone || '',
        status: editingUser.status || 'pending',
        laptop: editingUser.laptop ? String(editingUser.laptop).toLowerCase() : ''
      });
    } else {
      setForm(null);
    }
  }, [editingUser]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (!editingUser || !form) return null;


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">แก้ไขข้อมูลผู้สมัคร</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <FieldRow label="คำนำหน้า" editingValue={form.prefix} onChange={(v) => handleChange('prefix', v)} options={[{ value: '', label: 'เลือก' }, { value: 'นาย', label: 'นาย' }, { value: 'นางสาว', label: 'นางสาว' }, { value: 'เด็กชาย', label: 'เด็กชาย' }, { value: 'เด็กหญิง', label: 'เด็กหญิง' }]} />
        <FieldRow label="ชื่อ" editingValue={form.firstName} onChange={(v) => handleChange('firstName', v)} />
        <FieldRow label="นามสกุล" editingValue={form.lastName} onChange={(v) => handleChange('lastName', v)} />
        <FieldRow label="ชื่อเล่น" editingValue={form.nickname} onChange={(v) => handleChange('nickname', v)} />
        <FieldRow label="วันเกิด" editingValue={form.birthDate} onChange={(v) => handleChange('birthDate', v)} type="date" />
        <FieldRow label="อายุ" editingValue={form.age} onChange={(v) => handleChange('age', Number(v || 0))} type="number" />
        <FieldRow label="เพศ" editingValue={form.gender} onChange={(v) => handleChange('gender', v)} options={[{ value: '', label: 'เลือก' }, { value: 'ชาย', label: 'ชาย' }, { value: 'หญิง', label: 'หญิง' }, { value: 'ไม่ระบุ', label: 'ไม่ระบุ' }]} />
        <FieldRow label="โรงเรียน" editingValue={form.school} onChange={(v) => handleChange('school', v)} />
        <FieldRow label="ชั้น" editingValue={form.grade} onChange={(v) => handleChange('grade', v)} options={[{ value: '', label: 'เลือก' }, { value: 'ม.4', label: 'ม.4' }, { value: 'ม.5', label: 'ม.5' }, { value: 'ม.6', label: 'ม.6' }, { value: 'ประกาศนียบัตรวิชาชีพปีที่ 1', label: 'ประกาศนียบัตรวิชาชีพปีที่ 1' }, { value: 'ประกาศนียบัตรวิชาชีพปีที่ 2', label: 'ประกาศนียบัตรวิชาชีพปีที่ 2' }, { value: 'ประกาศนียบัตรวิชาชีพปีที่ 3', label: 'ประกาศนียบัตรวิชาชีพปีที่ 3' }]} />
        <FieldRow label="จังหวัด" editingValue={form.province} onChange={(v) => handleChange('province', v)} />
        <FieldRow label="เบอร์โทร" editingValue={form.phone} onChange={(v) => handleChange('phone', v)} />
        <FieldRow label="อีเมล" editingValue={form.email} onChange={(v) => handleChange('email', v)} type="email" />
        <FieldRow label="Line ID" editingValue={form.lineId} onChange={(v) => handleChange('lineId', v)} />
        <FieldRow label="ขนาดเสื้อ" editingValue={form.shirtSize} onChange={(v) => handleChange('shirtSize', v)} />
        <FieldRow label="อาการแพ้" editingValue={form.allergies} onChange={(v) => handleChange('allergies', v)} textarea />
        <FieldRow label="โรคประจำตัว" editingValue={form.medicalConditions} onChange={(v) => handleChange('medicalConditions', v)} textarea />
        <FieldRow label="ผู้ติดต่อฉุกเฉิน" editingValue={form.emergencyContact} onChange={(v) => handleChange('emergencyContact', v)} />
        <FieldRow label="เบอร์โทรฉุกเฉิน" editingValue={form.emergencyPhone} onChange={(v) => handleChange('emergencyPhone', v)} />
        <FieldRow label="สถานะ" editingValue={form.status} onChange={(v) => handleChange('status', v)} options={[{ value: 'pending', label: 'pending' }, { value: 'approved', label: 'approved' }, { value: 'rejected', label: 'rejected' }]} />
        <FieldRow label="มีแล็ปท็อป" editingValue={form.laptop} onChange={(v) => handleChange('laptop', v)} options={[{ value: '', label: 'เลือก' }, { value: 'yes', label: 'มี' }, { value: 'no', label: 'ไม่มี' }]} />
      </div>
      <div className="flex justify-end items-center gap-2">
        <button onClick={() => setEditingUser(null)} className="cursor-pointer px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm" disabled={saving}>ยกเลิก</button>
        <button onClick={() => onSave(form)} className="cursor-pointer px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </div>
    </div>
  );
}
