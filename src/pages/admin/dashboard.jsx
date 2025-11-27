import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';

// NOTE: install with: npm install recharts lucide-react

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [genderData, setGenderData] = useState([]);
    const [laptopData, setLaptopData] = useState([]);
    const [allergyList, setAllergyList] = useState([]);
    const [medicalList, setMedicalList] = useState([]);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // helper: laptop detection (schema: laptop: String -> 'yes' / 'no')
    const hasLaptop = (u) => {
        const v = u.laptop;
        if (!v) return false;
        return ['yes', 'มี', 'true', '1', 'y'].includes(String(v).toLowerCase());
    };

    // helper: allergies (schema: allergies: String)
    const extractAllergies = (u) => {
        if (!u.allergies) return [];
        return String(u.allergies)
            .split(/[;,\n]+/)
            .map(s => s.trim())
            .filter(Boolean);
    };

    // helper: medical conditions (schema: medicalConditions: String)
    const extractMedical = (u) => {
        if (!u.medicalConditions) return [];
        return String(u.medicalConditions)
            .split(/[;,\n]+/)
            .map(s => s.trim())
            .filter(Boolean);
    };

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/api/users/all`);
            if (res.ok) {
                const data = await res.json();

                // Calculate stats (based on schema.status)
                const statsData = {
                    total: data.length,
                    pending: data.filter(u => u.status === 'pending').length,
                    approved: data.filter(u => u.status === 'success').length,
                    rejected: data.filter(u => u.status === 'declined').length,
                };
                setStats(statsData);

                // Recent users
                const recent = data
                    .slice(0, 5)
                    .map(u => ({
                        id: u._id,
                        name: `${u.prefix || ''} ${u.firstName || ''} ${u.lastName || ''}`.trim(),
                        email: u.email || '-',
                        school: u.school || '-',
                        status: u.status === 'success' ? 'approved' : u.status === 'declined' ? 'rejected' : 'pending'
                    }));
                setRecentUsers(recent);

                // Gender chart data (schema: gender: String)
                const genderCounts = data.reduce((acc, u) => {
                    const g = (u.gender || '').toString().toLowerCase();
                    if (g === 'ชาย' || g === 'male' || g === 'm') acc.male++;
                    else if (g === 'หญิง' || g === 'female' || g === 'f') acc.female++;
                    else acc.unknown++;
                    return acc;
                }, { male: 0, female: 0, unknown: 0 });

                setGenderData([
                    { name: 'ชาย', value: genderCounts.male },
                    { name: 'หญิง', value: genderCounts.female },
                    { name: 'ไม่ระบุ', value: genderCounts.unknown },
                ]);

                // Laptop chart (schema: laptop: String)
                const laptopCounts = data.reduce((acc, u) => {
                    if (hasLaptop(u)) acc.with += 1; else acc.without += 1;
                    return acc;
                }, { with: 0, without: 0 });

                setLaptopData([
                    { name: 'มีโน้ตบุ๊ค', value: laptopCounts.with },
                    { name: 'ไม่มี', value: laptopCounts.without },
                ]);

                // Allergies list (schema: allergies: String)
                const allAllergies = [];
                data.forEach(u => {
                    const arr = extractAllergies(u);
                    if (arr.length > 0) {
                        allAllergies.push({ name: `${u.prefix || ''} ${u.firstName || ''} ${u.lastName || ''}`.trim() || u._id, foods: arr });
                    }
                });
                setAllergyList(allAllergies);

                // Medical conditions list (schema: medicalConditions: String)
                const allMedical = [];
                data.forEach(u => {
                    const arr = extractMedical(u);
                    if (arr.length > 0) {
                        allMedical.push({ name: `${u.prefix || ''} ${u.firstName || ''} ${u.lastName || ''}`.trim() || u._id, conditions: arr });
                    }
                });
                setMedicalList(allMedical);

            } else {
                console.error('Failed to fetch dashboard data, status:', res.status);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig = {
        approved: { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
        pending: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
        rejected: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
    };

    const COLORS = ['#60A5FA', '#F472B6', '#A78BFA', '#FBBF24'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <button
                    onClick={() => fetchDashboardData()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCcw size={18} />
                    รีเฟรช
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">ผู้สมัครทั้งหมด</p>
                        <Users size={20} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">รอตรวจสอบ</p>
                        <Clock size={20} className="text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">อนุมัติแล้ว</p>
                        <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500 font-medium">ปฏิเสธ</p>
                        <XCircle size={20} className="text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Gender Pie */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">สัดส่วนเพศ</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={80} label>
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Laptop Bar */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">มีโน้ตบุ๊ค / ไม่มี</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={laptopData}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value">
                                    {laptopData.map((entry, index) => (
                                        <Cell key={`cell-l-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Allergies + Medical */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">ผู้แพ้อาหาร / โรคประจำตัว (แพ้: {allergyList.length} / โรค: {medicalList.length})</h3>
                    <div className="max-h-52 overflow-y-auto space-y-3">
                        {allergyList.length === 0 && medicalList.length === 0 ? (
                            <p className="text-gray-400">ไม่พบข้อมูลผู้แพ้หรือโรคประจำตัว</p>
                        ) : (
                            <div className="space-y-2">
                                {allergyList.map((a, i) => (
                                    <div key={`alg-${i}`} className="border p-2 rounded">
                                        <div className="font-medium">{a.name}</div>
                                        <div className="text-sm text-gray-600">แพ้: {a.foods.join(', ')}</div>
                                    </div>
                                ))}

                                {medicalList.map((m, i) => (
                                    <div key={`med-${i}`} className="border p-2 rounded">
                                        <div className="font-medium">{m.name}</div>
                                        <div className="text-sm text-gray-600">โรคประจำตัว: {m.conditions.join(', ')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Users Table
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className='flex justify-end'>
                    <button onClick={() => window.location.href = '/admin/users'} className="cursor-pointer mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex justify-end items-center">
                        จัดการผู้สมัคร
                    </button>
                </div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">ผู้สมัครล่าสุด</h2>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        กำลังโหลดข้อมูล...
                    </div>
                ) : recentUsers.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                        ไม่มีข้อมูลผู้สมัคร
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ชื่อ</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">อีเมล</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">โรงเรียน</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.school}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[user.status].color}`}>
                                                {statusConfig[user.status].label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div> */}
        </div>
    );
}
