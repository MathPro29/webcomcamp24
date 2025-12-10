import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, Search, FileText, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CertificatesAdmin = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadErrors, setUploadErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [downloadDate, setDownloadDate] = useState('');
  const [settings, setSettings] = useState(null);

  const api = axios.create({
    baseURL: 'http://202.28.37.166:5000',
    withCredentials: true
  });

  // Fetch certificates
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/certificates/list');
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings(response.data);
      if (response.data.certificateDownloadDate) {
        const date = new Date(response.data.certificateDownloadDate);
        setDownloadDate(date.toISOString().slice(0, 16));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchSettings();
  }, []);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadErrors([]);
    setSuccessMessage('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('certificates', file);
    });

    try {
      const response = await api.post('/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessMessage(`อัปโหลดสำเร็จ ${response.data.uploaded} ไฟล์`);
        if (response.data.errors && response.data.errors.length > 0) {
          setUploadErrors(response.data.errors);
        }
        fetchCertificates();
        e.target.value = ''; // Reset file input
      }
    } catch (error) {
      console.error('Error uploading certificates:', error);
      setUploadErrors([{ fileName: 'ทั้งหมด', error: 'เกิดข้อผิดพลาดในการอัปโหลด' }]);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id, firstName, lastName) => {
    if (!confirm(`ต้องการลบเกียรติบัตรของ ${firstName} ${lastName} หรือไม่?`)) {
      return;
    }

    try {
      await api.delete(`/api/certificates/${id}`);
      setSuccessMessage('ลบเกียรติบัตรเรียบร้อยแล้ว');
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('เกิดข้อผิดพลาดในการลบเกียรติบัตร');
    }
  };

  // Update download date
  const handleUpdateDownloadDate = async () => {
    try {
      const dateValue = downloadDate ? new Date(downloadDate).toISOString() : null;
      await api.put('/api/settings', {
        certificateDownloadDate: dateValue
      });
      setSuccessMessage('อัปเดตวันที่ดาวน์โหลดเรียบร้อยแล้ว');
      fetchSettings();
    } catch (error) {
      console.error('Error updating download date:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตวันที่');
    }
  };

  // Filter certificates
  const filteredCertificates = certificates.filter(cert =>
    cert.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">จัดการเกียรติบัตร</h1>
          <p className="text-gray-400">อัปโหลดและจัดการเกียรติบัตรของผู้เข้าร่วม</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {uploadErrors.length > 0 && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 font-semibold">พบข้อผิดพลาดในการอัปโหลด:</p>
            </div>
            <ul className="ml-8 space-y-1">
              {uploadErrors.map((err, idx) => (
                <li key={idx} className="text-red-300 text-sm">
                  {err.fileName}: {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-[#1a1d3b] rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            อัปโหลดเกียรติบัตร
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              เลือกไฟล์เกียรติบัตร (PDF, PNG, JPG) - ตั้งชื่อไฟล์เป็น ชื่อ_นามสกุล.pdf
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full bg-[#101330] border border-gray-600 rounded-lg px-4 py-3 
                       focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                       file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:bg-yellow-500 file:text-white file:font-semibold
                       hover:file:bg-yellow-600 file:cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {uploading && (
            <div className="text-yellow-400 text-sm">กำลังอัปโหลด...</div>
          )}
        </div>

        {/* Download Date Setting */}
        <div className="bg-[#1a1d3b] rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            ตั้งวันที่เปิดให้ดาวน์โหลด
          </h2>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">
                วันที่และเวลา (เว้นว่างไว้ = เปิดให้ดาวน์โหลดทันที)
              </label>
              <input
                type="datetime-local"
                value={downloadDate}
                onChange={(e) => setDownloadDate(e.target.value)}
                className="w-full bg-[#101330] border border-gray-600 rounded-lg px-4 py-3
                         focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <button
              onClick={handleUpdateDownloadDate}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold 
                       px-6 py-3 rounded-lg transition-all"
            >
              บันทึก
            </button>
          </div>
          
          {settings?.certificateDownloadDate && (
            <p className="mt-3 text-sm text-gray-400">
              ปัจจุบัน: เปิดให้ดาวน์โหลดตั้งแต่ {new Date(settings.certificateDownloadDate).toLocaleString('th-TH')}
            </p>
          )}
        </div>

        {/* Certificates List */}
        <div className="bg-[#1a1d3b] rounded-xl border border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              เกียรติบัตรทั้งหมด ({filteredCertificates.length})
            </h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#101330] border border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'ไม่พบเกียรติบัตรที่ค้นหา' : 'ยังไม่มีเกียรติบัตร'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">ชื่อ-นามสกุล</th>
                    <th className="text-left py-3 px-4">ชื่อไฟล์</th>
                    <th className="text-left py-3 px-4">ขนาด</th>
                    <th className="text-left py-3 px-4">วันที่อัปโหลด</th>
                    <th className="text-left py-3 px-4">อัปโหลดโดย</th>
                    <th className="text-right py-3 px-4">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr key={cert._id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-medium">
                        {cert.firstName} {cert.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{cert.fileName}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {(cert.fileSize / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(cert.uploadDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{cert.uploadedBy}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(cert._id, cert.firstName, cert.lastName)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificatesAdmin;
