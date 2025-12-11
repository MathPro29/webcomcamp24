import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, Download } from 'lucide-react';

export default function CheckRegistration() {
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://202.28.37.166:5000';

    const statusConfig = {
        approved: {
            label: 'ผ่านการสมัคร',
            color: 'bg-green-50 border-green-200 text-green-800',
            icon: <CheckCircle size={24} className="text-green-600" />,
            bgColor: 'bg-green-100',
            textColor: 'text-green-900'
        },
        pending: {
            label: 'รอตรวจสอบ',
            color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: <Clock size={24} className="text-yellow-600" />,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-900'
        },
        rejected: {
            label: 'ไม่ผ่านการสมัคร',
            color: 'bg-red-50 border-red-200 text-red-800',
            icon: <XCircle size={24} className="text-red-600" />,
            bgColor: 'bg-red-100',
            textColor: 'text-red-900'
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchEmail.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`${API_BASE}/api/users/all`);
            if (res.ok) {
                const allUsers = await res.json();
                const filtered = allUsers.filter(u =>
                    u.email.toLowerCase().includes(searchEmail.toLowerCase())
                );
                const mapped = filtered.map(u => ({
                    id: u._id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    phone: u.phone,
                    school: u.school,
                    status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending',
                    certificate: u.certificate // Pass certificate data
                }));
                setSearchResults(mapped);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        ตรวจสอบผลการสมัคร
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        ป้อนอีเมลของคุณเพื่อตรวจสอบสถานะการสมัครเข้าประกวด
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="กรอกอีเมลของคุณ..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-xl transition-colors whitespace-nowrap"
                        >
                            {isSearching ? 'กำลังค้นหา...' : 'ตรวจสอบ'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {searchResults.length > 0 ? (
                    <div className="space-y-4">
                        {searchResults.map((user) => {
                            const config = statusConfig[user.status];
                            const isExpanded = expandedId === user.id;
                            return (
                                <div
                                    key={user.id}
                                    className={`border-2 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg ${config.color}`}
                                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                                >
                                    {/* Summary Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-3 rounded-full ${config.bgColor}`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-bold ${config.textColor}`}>{user.name}</h3>
                                                <p className={`text-sm ${config.textColor} opacity-75`}>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-6 py-2 rounded-full font-semibold text-center ${config.bgColor} ${config.textColor}`}>
                                                {config.label}
                                            </div>
                                            <ChevronDown
                                                size={24}
                                                className={`${config.textColor} transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="mt-6 pt-6 border-t-2 border-current border-opacity-20 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold opacity-75 mb-1">โรงเรียน</p>
                                                    <p className={`text-lg font-medium ${config.textColor}`}>{user.school}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold opacity-75 mb-1">เบอร์โทรศัพท์</p>
                                                    <p className={`text-lg font-medium ${config.textColor}`}>{user.phone || '-'}</p>
                                                </div>
                                            </div>

                                            {/* Status Message */}
                                            <div className={`p-4 rounded-lg ${config.bgColor}`}>
                                                {user.status === 'approved' && (
                                                    <div className="flex gap-3">
                                                        <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold text-green-900">ยินดีด้วย!</p>
                                                            <p className="text-sm text-green-800 mt-1">
                                                                คุณผ่านการสมัครแล้ว กรุณารอติดต่อจากทางทีมงานต่อไป
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.status === 'pending' && (
                                                    <div className="flex gap-3">
                                                        <Clock size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold text-yellow-900">อยู่ระหว่างการตรวจสอบ</p>
                                                            <p className="text-sm text-yellow-800 mt-1">
                                                                การสมัครของคุณกำลังอยู่ระหว่างการตรวจสอบ กรุณารอสักครู่
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.status === 'rejected' && (
                                                    <div className="flex gap-3">
                                                        <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold text-red-900">ไม่ผ่านการสมัคร</p>
                                                            <p className="text-sm text-red-800 mt-1">
                                                                ขออภัย การสมัครของคุณไม่ผ่านการสมัครคัดเลือก ขอบคุณที่สนใจ
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Certificate Section */}
                                            {user.certificate && user.certificate.filename && user.status !== 'rejected' && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-2">เกียรติบัตร</h4>
                                                    {(() => {
                                                        const releaseDate = user.certificate.releaseDate ? new Date(user.certificate.releaseDate) : null;
                                                        const now = new Date();
                                                        const canDownload = !releaseDate || now >= releaseDate;

                                                        if (canDownload) {
                                                            return (
                                                                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                                            <CheckCircle size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-gray-800">เกียรติบัตรของคุณพร้อมแล้ว</p>
                                                                            <p className="text-sm text-gray-500">คุณสามารถตรวจสอบและดาวน์โหลดได้ทันที</p>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={`${API_BASE}/api/users/${user.id}/certificate/download`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Download size={20} />
                                                                        ดู / ดาวน์โหลด
                                                                    </a>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                                                    <Clock size={24} className="text-gray-400" />
                                                                    <div>
                                                                        <p className="text-gray-600 font-medium">เกียรติบัตรจะเปิดให้ดาวน์โหลดในวันที่</p>
                                                                        <p className="text-blue-600 font-bold">
                                                                            {releaseDate.toLocaleDateString('th-TH', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    searchEmail && !isSearching && (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบผลลัพธ์</h3>
                            <p className="text-gray-600">
                                ไม่พบข้อมูลการสมัครสำหรับอีเมล "{searchEmail}"
                            </p>
                            <p className="text-sm text-gray-500 mt-4">
                                กรุณาตรวจสอบอีเมลของคุณ หรือติดต่อทีมงานในกรณีที่มีข้อสงสัย
                            </p>
                        </div>
                    )
                )}

                {/* Info Box */}
                {!searchResults.length && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center mt-12">
                        <p className="text-gray-700 text-lg">
                            <span className="font-semibold text-blue-900">💡 เคล็ดลับ:</span> ใช้อีเมลที่คุณใช้ในการสมัครเพื่อค้นหาผลลัพธ์
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
