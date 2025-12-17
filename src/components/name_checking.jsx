import { useState, useMemo } from "react";
import { Search, AlertCircle, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { limitrefresh } from "../utils/limitrefresh";

const NameChecking = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // สร้าง API instance
  const api = useMemo(() => {
    const baseURL = import.meta.env.VITE_API_URL || "https://comcamp.csmju.com:5000";

    return {
      get: async (endpoint) => {
        const res = await fetch(`${baseURL}${endpoint}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return { data: await res.json() };
      }
    };
  }, []);

  // ฟังก์ชันค้นหา
  const handleSearch = async () => {
    // Check rate limit before proceeding
    if (!limitrefresh()) {
      return; // Block the search if rate limit exceeded
    }

    const first = firstName.trim();
    const last = lastName.trim();

    if (!first || !last) {
      setError("กรุณากรอกชื่อและนามสกุลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);
    setHasSearched(false);

    try {
      // เรียก API เพื่อค้นหา
      const res = await api.get(`/api/users/search?firstName=${encodeURIComponent(first)}&lastName=${encodeURIComponent(last)}`);

      if (res.data.found) {
        setSearchResult(res.data.user);
      } else {
        setSearchResult(null);
      }
      setHasSearched(true);
    } catch (err) {
      console.error("ค้นหาล้มเหลว:", err);
      setError("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันล้างข้อมูล
  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setSearchResult(null);
    setError(null);
    setHasSearched(false);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  // สีและไอคอนตามสถานะ
  const getStatusDisplay = (status) => {
    switch (status) {
      case "success":
        return {
          text: "ผ่านการคัดเลือก",
          color: "text-green-400",
          bg: "bg-green-400/10",
          border: "border-green-400/30",
          icon: <CheckCircle className="w-8 h-8" />
        };
      case "pending":
        return {
          text: "รอการตรวจสอบ",
          color: "text-yellow-400",
          bg: "bg-yellow-400/10",
          border: "border-yellow-400/30",
          icon: <Clock className="w-8 h-8" />
        };
      case "declined":
        return {
          text: "ไม่ผ่านการคัดเลือก",
          color: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/30",
          icon: <XCircle className="w-8 h-8" />
        };
      default:
        return {
          text: "ไม่ทราบสถานะ",
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          border: "border-gray-400/30",
          icon: <AlertCircle className="w-8 h-8" />
        };
    }
  };

  return (
    <section id="name_checking" className="bg-[#101330] py-12 sm:py-16 text-white min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm font-semibold text-yellow-400">
            ตรวจสอบรายชื่อ
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            ตรวจสอบรายชื่อเข้าค่าย ComCamp 24<sup>th</sup>
          </h2>
          <p className="mt-2 text-gray-300">
            กรอกชื่อ-นามสกุล เพื่อตรวจสอบสถานะการสมัคร
          </p>
        </div>

        {/* Parental Consent Download Button */}
        <div className="max-w-sm mx-auto mb-6">
          <a
            href="https://drive.google.com/file/d/1Rpe3AW60AHT3xDDZR5QlxJPPWczhhVjL/view"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r px-3 py-4 rounded-lg from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-red-400/30"
          >
            <Download className="w-5 h-5" />
            <span>ดาวน์โหลดเอกสารขออนุญาตผู้ปกครอง</span>
          </a>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-[#1a1d3b] p-6 rounded-xl border border-gray-700 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* ชื่อ */}
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

              {/* นามสกุล */}
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
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </button>

              {(searchResult || hasSearched) && (
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
            {searchResult ? (
              // พบข้อมูล
              <div className="bg-[#1a1d3b] rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                {/* Status Header */}
                <div className={`${getStatusDisplay(searchResult.status).bg} ${getStatusDisplay(searchResult.status).border} border-b p-6`}>
                  <div className="flex items-center gap-4">
                    <div className={getStatusDisplay(searchResult.status).color}>
                      {getStatusDisplay(searchResult.status).icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        สถานะการสมัคร
                      </h3>
                      <p className={`text-lg font-semibold ${getStatusDisplay(searchResult.status).color}`}>
                        {getStatusDisplay(searchResult.status).text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">ชื่อ-นามสกุล</p>
                      <p className="text-white font-medium">
                        {searchResult.firstName} {searchResult.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">โรงเรียน</p>
                      <p className="text-white font-medium">
                        {searchResult.school || "ไม่ระบุ"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">ชั้นปี</p>
                      <p className="text-white font-medium">
                        {searchResult.grade || "ไม่ระบุ"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">อีเมล</p>
                      <p className="text-white font-medium break-all">
                        {searchResult.email || "ไม่ระบุ"}
                      </p>
                    </div>
                  </div>

                  {/* Certificate Section */}
                  {searchResult.certificate && searchResult.certificate.fileData && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                        < CheckCircle className="w-4 h-4" /> เกียรติบัตร
                      </h4>
                      {(() => {
                        const releaseDate = searchResult.certificate.releaseDate ? new Date(searchResult.certificate.releaseDate) : null;
                        const now = new Date();
                        const canDownload = !releaseDate || now >= releaseDate;

                        if (canDownload) {
                          return (
                            <a
                              href={`https://comcamp.csmju.com:5000/api/users/${searchResult._id}/certificate/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center sm:w-auto"
                            >
                              <Download className="w-4 h-4" />
                              ดาวน์โหลดเกียรติบัตร
                            </a>
                          );
                        } else {
                          return (
                            <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                              <p>เกียรติบัตรจะเปิดให้ดาวน์โหลดในวันที่:</p>
                              <p className="text-yellow-400 font-medium mt-1">
                                {releaseDate.toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                น.
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {searchResult.status === "pending" && (
                    <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                      <p className="text-yellow-400 text-sm text-center">
                        ⏳ ใบสมัครของคุณอยู่ระหว่างการพิจารณา กรุณารอประกาศผลอย่างเป็นทางการ
                      </p>
                      <p className="text-center items-center mt-2">
                        หรือ หากยังไม่ได้ชำระเงิน <a href="/payment" className="text-[#e38e0e] hover:underline">ชำระเงินตอนนี้!</a>
                      </p>
                    </div>

                  )}

                  {searchResult.status === "declined" && (
                    <div className="mt-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg">
                      <p className="text-red-400 text-sm">
                        ขออภัย คุณไม่ผ่านการคัดเลือกในครั้งนี้ ขอบคุณที่สนใจเข้าร่วมค่าย ComCamp
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // ไม่พบข้อมูล
              <div className="bg-[#1a1d3b] border border-gray-700 rounded-xl p-8 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  ไม่พบข้อมูลผู้สมัคร
                </h3>
                <p className="text-gray-400 mb-4">
                  ไม่พบชื่อ <span className="text-white font-medium">{firstName} {lastName}</span> ในระบบ
                </p>
                <p className="text-sm text-gray-500">
                  กรุณาตรวจสอบชื่อ-นามสกุลที่กรอกให้ถูกต้อง<br />
                  หากยังไม่ได้สมัคร กรุณาสมัครผ่านแบบฟอร์มสมัครเข้าค่าย
                </p>
                <p>หรือ <a href="/register" className="text-[#e38e0e] hover:underline">สมัครตอนนี้!</a></p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="max-w-2xl mx-auto text-center py-10">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              กรอกชื่อ-นามสกุลของคุณด้านบนเพื่อตรวจสอบสถานะการสมัคร
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default NameChecking;