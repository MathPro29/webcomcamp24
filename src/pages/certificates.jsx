import { useState } from 'react';
import { Search, Download, AlertCircle, FileText, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Certificates = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const api = axios.create({
    baseURL: 'http://202.28.37.166:5000',
    withCredentials: true
  });

  // Search for certificate
  const handleSearch = async () => {
    const first = firstName.trim();
    const last = lastName.trim();

    if (!first || !last) {
      setError('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);
    setHasSearched(false);

    try {
      const response = await api.get(`/api/certificates/search?firstName=${encodeURIComponent(first)}&lastName=${encodeURIComponent(last)}`);
      
      if (response.data.found) {
        setCertificate(response.data.certificate);
      } else {
        setCertificate(null);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
      setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Download certificate
  const handleDownload = async () => {
    if (!certificate) return;

    try {
      const response = await api.get(`/api/certificates/download/${certificate.id}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', certificate.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      if (err.response?.status === 403) {
        setError('ยังไม่ถึงวันที่สามารถดาวน์โหลดได้');
      } else {
        setError('เกิดข้อผิดพลาดในการดาวน์โหลด กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  // Clear search
  const handleClear = () => {
    setFirstName('');
    setLastName('');
    setCertificate(null);
    setError(null);
    setHasSearched(false);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <section className="bg-[#101330] py-12 sm:py-16 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm font-semibold text-yellow-400">
            เกียรติบัตร
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            ดาวน์โหลดเกียรติบัตร ComCamp 24<sup>th</sup>
          </h2>
          <p className="mt-2 text-gray-300">
            ค้นหาและดาวน์โหลดเกียรติบัตรของคุณ
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-[#1a1d3b] p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ชื่อ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="เช่น สมชาย"
                  className="w-full rounded-lg border border-gray-600 bg-[#101330] px-4 py-3
                           focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white
                           placeholder-gray-400"
                  disabled={loading}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  นามสกุล <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="เช่น ใจดี"
                  className="w-full rounded-lg border border-gray-600 bg-[#101330] px-4 py-3
                           focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white
                           placeholder-gray-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="cursor-pointer flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 
                         text-white font-semibold py-3 px-6 rounded-lg transition-all
                         flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </button>
              
              {(certificate || hasSearched) && (
                <button
                  onClick={handleClear}
                  className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold 
                           py-3 px-6 rounded-lg transition-all"
                >
                  ค้นหาใหม่
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Search Result */}
        {hasSearched && !loading && (
          <div className="max-w-2xl mx-auto">
            {certificate ? (
              // Certificate found
              <div className="bg-[#1a1d3b] rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                {/* Success Header */}
                <div className="bg-green-400/10 border-b border-green-400/30 p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-green-400">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        พบเกียรติบัตร
                      </h3>
                      <p className="text-lg font-semibold text-green-400">
                        {certificate.firstName} {certificate.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span>{certificate.fileName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>อัปโหลดเมื่อ: {new Date(certificate.uploadDate).toLocaleDateString('th-TH')}</span>
                  </div>

                  {/* Download Status */}
                  {certificate.canDownload ? (
                    <div className="mt-6">
                      <button
                        onClick={handleDownload}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold 
                                 py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        ดาวน์โหลดเกียรติบัตร
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                      <p className="text-yellow-400 text-sm text-center">
                        ⏳ เกียรติบัตรจะเปิดให้ดาวน์โหลดได้ตั้งแต่วันที่{' '}
                        {new Date(certificate.downloadDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Certificate not found
              <div className="bg-[#1a1d3b] border border-gray-700 rounded-xl p-8 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  ไม่พบเกียรติบัตร
                </h3>
                <p className="text-gray-400 mb-4">
                  ไม่พบเกียรติบัตรของ <span className="text-white font-medium">{firstName} {lastName}</span> ในระบบ
                </p>
                <p className="text-sm text-gray-500">
                  กรุณาตรวจสอบชื่อ-นามสกุลที่กรอกให้ถูกต้อง<br />
                  หรือติดต่อเจ้าหน้าที่หากมีข้อสงสัย
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="max-w-2xl mx-auto text-center py-10">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              กรอกชื่อ-นามสกุลของคุณด้านบนเพื่อค้นหาเกียรติบัตร
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Certificates;
