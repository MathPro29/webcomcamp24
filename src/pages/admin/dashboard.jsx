import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Clock, CheckCircle, XCircle, RotateCcw, Search, Download, } from 'lucide-react';
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

// Improved Dashboard (single-file React + Tailwind)
// - Cleaner layout and spacing
// - Compact stat cards with subtle icons
// - Loading skeleton overlay
// - Collapsible allergy list (preview + expand)
// - Search/filter input (client-side) to quickly find schools/provinces

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [genderData, setGenderData] = useState([]);
  const [laptopData, setLaptopData] = useState([]);
  const [allergyList, setAllergyList] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [provinceData, setProvinceData] = useState([]);
  const [shirtSizeData, setShirtSizeData] = useState([]);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('schools'); // 'schools', 'provinces', 'allergies'
  const [showAllAllergies, setShowAllAllergies] = useState(false);
  const [statusData, setStatusData] = useState([]);

  const API_BASE = 'https://comcamp.csmju.com:5000';
  // helper: laptop detection (stable, moved above fetch so fetch can call it)
  const hasLaptop = (u) => {
    const v = u.laptop;
    if (!v) return false;
    return ['yes', 'มี', 'true', '1', 'y'].includes(String(v).toLowerCase());
  };

  // helper: normalize and filter lists (stable)
  const extractList = (raw) => {
    if (!raw) return [];
    return String(raw)
      .split(/[;,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !['-', 'ไม่มี', 'ไม่'].some((skip) => s.includes(skip)));
  };

  // helper: normalize school names to group similar names together
  const normalizeSchoolName = (name) => {
    if (!name) return 'ไม่ระบุ';

    let normalized = name.trim();

    // Remove common prefixes (case-insensitive)
    const prefixes = ['โรงเรียน', 'ร.ร.', 'ร.ร', 'วิทยาลัย', 'ว.', 'มหาวิทยาลัย', 'ม.'];

    for (const prefix of prefixes) {
      // Remove prefix at the start (with optional space after)
      const regex = new RegExp(`^${prefix}\\s*`, 'i');
      normalized = normalized.replace(regex, '');
    }

    // Trim again after removing prefix
    normalized = normalized.trim();

    return normalized || name.trim(); // Return original if normalized is empty
  };

  // Stable fetch function so useEffect doesn't depend on a recreated function
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/users/all`);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();


      const pendingCount = data.filter((u) => u.status === 'pending').length;
      const approvedCount = data.filter((u) => u.status === 'success').length;
      const rejectedCount = data.filter((u) => u.status === 'declined').length;
      setStats({
        total: data.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      });
      setStatusData([
        { name: 'รอตรวจสอบ', value: pendingCount },
        { name: 'อนุมัติแล้ว', value: approvedCount },
        { name: 'ปฏิเสธ', value: rejectedCount },
      ]);

      // Gender
      const genderCounts = data.reduce(
        (acc, u) => {
          const g = (u.gender || '').toString().toLowerCase();
          if (g === 'ชาย' || g === 'male' || g === 'm') acc.male++;
          else if (g === 'หญิง' || g === 'female' || g === 'f') acc.female++;
          else acc.unknown++;
          return acc;
        },
        { male: 0, female: 0, unknown: 0 }
      );
      setGenderData([
        { name: 'ชาย', value: genderCounts.male },
        { name: 'หญิง', value: genderCounts.female },
        { name: 'ไม่ระบุ', value: genderCounts.unknown },
      ]);

      // Laptop
      const laptopCounts = data.reduce((acc, u) => {
        if (hasLaptop(u)) acc.with += 1;
        else acc.without += 1;
        return acc;
      }, { with: 0, without: 0 });
      setLaptopData([
        { name: 'มีโน้ตบุ๊ค', value: laptopCounts.with },
        { name: 'ไม่มี', value: laptopCounts.without },
      ]);

      // Allergies & medical (group by person)
      const personHealthMap = new Map();
      data.forEach((u) => {
        const fullName = `${u.prefix || ''} ${u.firstName || ''} ${u.lastName || ''}`.trim() || u._id;
        const allergies = extractList(u.allergies);
        const medical = extractList(u.medicalConditions);
        if (allergies.length > 0 || medical.length > 0) {
          if (!personHealthMap.has(fullName)) personHealthMap.set(fullName, { allergies: [], medical: [] });
          const ex = personHealthMap.get(fullName);
          ex.allergies.push(...allergies);
          ex.medical.push(...medical);
        }
      });
      const combined = Array.from(personHealthMap, ([name, d]) => ({ name, allergies: [...new Set(d.allergies)], medical: [...new Set(d.medical)] }));
      setAllergyList(combined);


      const gradeCounts = data.reduce((acc, u) => {
        const g = (u.grade || 'ไม่ระบุ').toString().trim();
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {});

      const gradeOrder = {
        "ม.4": 10,
        "ม.5": 20,
        "ม.6": 30,
        "ปวช.1": 40,
        "ปวช.2": 50,
        "ปวช.3": 60,
        "ไม่ระบุ": 999
      };

      const gradeDataArray = Object.entries(gradeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (gradeOrder[a.name] || 999) - (gradeOrder[b.name] || 999));

      setGradeData(gradeDataArray);


      const schoolMap = new Map();

      data.forEach((u) => {
        const originalName = (u.school || 'ไม่ระบุ').trim();
        const normalizedName = normalizeSchoolName(originalName);

        if (!schoolMap.has(normalizedName)) {
          schoolMap.set(normalizedName, { fullNames: {}, count: 0 });
        }

        const entry = schoolMap.get(normalizedName);
        entry.count += 1;
        entry.fullNames[originalName] = (entry.fullNames[originalName] || 0) + 1;
      });

      const schoolCounts = Array.from(schoolMap.entries()).map(([normalized, data]) => {
        const mostCommonFullName = Object.entries(data.fullNames)
          .sort((a, b) => b[1] - a[1])[0][0];

        return {
          name: mostCommonFullName.length > 28 ? mostCommonFullName.slice(0, 28) + '...' : mostCommonFullName,
          value: data.count
        };
      });

      const topSchools = schoolCounts
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      setSchoolData(topSchools);

      // Province - ✅ เพิ่มส่วนนี้
      const provinceCounts = data.reduce((acc, u) => {
        const p = (u.province || 'ไม่ระบุ').trim();
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {});

      const topProvinces = Object.entries(provinceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));

      setProvinceData(topProvinces);

      // Shirt Size Distribution
      const shirtSizeCounts = data.reduce((acc, u) => {
        const size = (u.shirtSize || 'ไม่ระบุ').trim();
        acc[size] = (acc[size] || 0) + 1;
        return acc;
      }, {});

      const sizeOrder = {
        "S": 1,
        "M": 2,
        "L": 3,
        "XL": 4,
        "2XL": 5,
        "3XL": 6,
        "4XL": 7,
        "ไม่ระบุ": 999
      };

      const shirtSizeArray = Object.entries(shirtSizeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (sizeOrder[a.name] || 999) - (sizeOrder[b.name] || 999));

      setShirtSizeData(shirtSizeArray);

    } catch (err) {
      console.error('fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  // Color mappings for different chart types
  const getStatusColor = (name) => {
    if (name === 'รอตรวจสอบ') return '#FF9800'; // orange
    if (name === 'อนุมัติแล้ว') return '#4CAF50'; // green
    if (name === 'ปฏิเสธ') return '#F44336'; // red
    return '#9E9E9E'; // gray fallback
  };

  const getGenderColor = (name) => {
    if (name === 'ชาย') return '#2196F3'; // blue
    if (name === 'หญิง') return '#E91E63'; // pink
    return '#9E9E9E'; // gray for unknown
  };

  const getLaptopColor = (name) => {
    if (name === 'มีโน้ตบุ๊ค') return '#4CAF50'; // green
    if (name === 'ไม่มี') return '#FF9800'; // orange
    return '#9E9E9E'; // gray fallback
  };

  // Client-side filtered views (search by school/province/name)
  const filteredSchools = useMemo(() => schoolData.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())), [schoolData, query]);
  const filteredProvinces = useMemo(() => provinceData.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), [provinceData, query]);
  const filteredAllergies = useMemo(() => allergyList.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), [allergyList, query]);

  // CSV Export Function
  const exportToCSV = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/users/all`);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();

      // Define CSV headers
      const headers = [
        'คำนำหน้า',
        'ชื่อ',
        'นามสกุล',
        'ชื่อเล่น',
        'วันเกิด',
        'อายุ',
        'เพศ',
        'โรงเรียน',
        'ระดับชั้น',
        'จังหวัด',
        'เบอร์โทร',
        'เบอร์ผู้ปกครอง',
        'อีเมล',
        'LINE ID',
        'ไซส์เสื้อ',
        'อาหารที่แพ้',
        'โรคประจำตัว',
        'ผู้ติดต่อฉุกเฉิน',
        'เบอร์ฉุกเฉิน',
        'มีโน้ตบุ๊ค',
        'สถานะ'
      ];

      // Convert data to CSV rows
      const csvRows = data.map(user => [
        user.prefix || '',
        user.firstName || '',
        user.lastName || '',
        user.nickname || '',
        user.birthDate || '',
        user.age || '',
        user.gender || '',
        user.school || '',
        user.grade || '',
        user.province || '',
        user.phone || '',
        user.parentPhone || '',
        user.email || '',
        user.lineId || '',
        user.shirtSize || '',
        user.allergies || '',
        user.medicalConditions || '',
        user.emergencyContact || '',
        user.emergencyPhone || '',
        user.laptop || '',
        user.status || ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create blob with UTF-8 BOM for proper Thai character encoding
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `comcamp24_applicants_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('CSV export error', err);
      alert('เกิดข้อผิดพลาดในการ export CSV');
    } finally {
      setIsLoading(false);
    }
  };

  // Export Shirt Size Data to CSV
  const exportShirtSizeCSV = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/users/all`);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();

      // Count shirt sizes
      const shirtSizeCounts = {};
      data.forEach(user => {
        const size = user.shirtSize || 'ไม่ระบุ';
        shirtSizeCounts[size] = (shirtSizeCounts[size] || 0) + 1;
      });

      // Create summary CSV
      const summaryHeaders = ['ไซส์เสื้อ', 'จำนวน (คน)'];
      const summaryRows = Object.entries(shirtSizeCounts)
        .sort((a, b) => {
          const sizeOrder = { "S": 1, "M": 2, "L": 3, "XL": 4, "2XL": 5, "3XL": 6, "4XL": 7 };
          return (sizeOrder[a[0]] || 999) - (sizeOrder[b[0]] || 999);
        })
        .map(([size, count]) => [size, count]);

      // Add total
      const total = Object.values(shirtSizeCounts).reduce((sum, count) => sum + count, 0);
      summaryRows.push(['รวมทั้งหมด', total]);

      const summaryCsv = [
        summaryHeaders.join(','),
        ...summaryRows.map(row => row.join(','))
      ].join('\n');

      // Create detailed CSV with user info
      const detailHeaders = ['ชื่อ-นามสกุล', 'ไซส์เสื้อ', 'โรงเรียน', 'เบอร์โทร'];
      const detailRows = data
        .sort((a, b) => {
          const sizeOrder = { "S": 1, "M": 2, "L": 3, "XL": 4, "2XL": 5, "3XL": 6, "4XL": 7 };
          const sizeA = a.shirtSize || 'ไม่ระบุ';
          const sizeB = b.shirtSize || 'ไม่ระบุ';
          return (sizeOrder[sizeA] || 999) - (sizeOrder[sizeB] || 999);
        })
        .map(user => [
          `${user.prefix || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.shirtSize || 'ไม่ระบุ',
          user.school || '',
          user.phone || ''
        ]);

      const detailCsv = [
        detailHeaders.join(','),
        ...detailRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Combine both CSVs
      const fullCsv = `สรุปไซส์เสื้อ\n${summaryCsv}\n\n\nรายละเอียดผู้สมัคร\n${detailCsv}`;

      // Create blob with UTF-8 BOM
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + fullCsv], { type: 'text/csv;charset=utf-8;' });

      // Download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shirt_sizes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Shirt size CSV export error', err);
      alert('เกิดข้อผิดพลาดในการ export ข้อมูลไซส์เสื้อ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">ภาพรวมข้อมูลผู้สมัคร</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportShirtSizeCSV}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
          >
            <Download size={16} />
            Export ไซส์เสื้อ
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
          >
            <Download size={16} />
            Export ข้อมูลทั้งหมด
          </button>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <RotateCcw size={16} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ผู้สมัครทั้งหมด', value: stats.total, color: 'border-blue-500', icon: <Users size={18} /> },
          { label: 'รอตรวจสอบ', value: stats.pending, color: 'border-yellow-400', icon: <Clock size={18} /> },
          { label: 'อนุมัติแล้ว', value: stats.approved, color: 'border-green-500', icon: <CheckCircle size={18} /> },
          { label: 'ปฏิเสธ', value: stats.rejected, color: 'border-red-500', icon: <XCircle size={18} /> },
        ].map((c) => (
          <div key={c.label} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${c.color}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 font-medium">{c.label}</div>
              <div className="text-gray-400">{c.icon}</div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{c.value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Charts - Main 4 only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">สถานะการสมัคร</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`s-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">สัดส่วนเพศ</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {genderData.map((entry, index) => (
                    <Cell key={`g-${index}`} fill={getGenderColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Laptop */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">มีโน้ตบุ๊ค</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={laptopData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {laptopData.map((entry, i) => (
                    <Cell key={`l-${i}`} fill={getLaptopColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution (List) */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">การกระจายตามชั้นเรียน</h3>

          <ul className="space-y-2">
            {gradeData.map((g) => (
              <li
                key={g.name}
                className="flex justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span>{g.name}</span>
                <span className="font-semibold">{g.value} คน</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Shirt Size Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">ไซส์เสื้อ</h3>
            <button
              onClick={exportShirtSizeCSV}
              className="text-xs flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition cursor-pointer"
            >
              <Download size={12} />
              Export
            </button>
          </div>

          <ul className="space-y-2">
            {shirtSizeData.map((s) => (
              <li
                key={s.name}
                className="flex justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span>{s.name}</span>
                <span className="font-semibold">{s.value} คน</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Tabbed Secondary Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {/* Tab Buttons */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('schools')}
            className={`cursor-pointer  px-4 py-2 font-semibold text-sm transition-all ${activeTab === 'schools'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            โรงเรียน
          </button>
          <button
            onClick={() => setActiveTab('provinces')}
            className={`cursor-pointer  px-4 py-2 font-semibold text-sm transition-all ${activeTab === 'provinces'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            จังหวัด
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`cursor-pointer  px-4 py-2 font-semibold text-sm transition-all ${activeTab === 'allergies'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            ผู้แพ้ / โรคประจำตัว
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Schools Tab */}
          {activeTab === 'schools' && (
            <div>
              <h4 className="font-semibold mb-3">โรงเรียนยอดนิยม</h4>
              {filteredSchools.length === 0 ? (
                <p className="text-sm text-gray-400">ไม่พบโรงเรียนที่ตรงกับการค้นหา</p>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={filteredSchools} layout="vertical" margin={{ left: 80 }}>
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#F472B6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Provinces Tab */}
          {activeTab === 'provinces' && (
            <div>
              <h4 className="font-semibold mb-3">จังหวัดยอดนิยม</h4>
              {filteredProvinces.length === 0 ? (
                <p className="text-sm text-gray-400">ไม่พบจังหวัดที่ตรงกับการค้นหา</p>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={filteredProvinces} layout="vertical" margin={{ left: 80 }}>
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FBBF24" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Allergies Tab */}
          {activeTab === 'allergies' && (
            <div>
              <h4 className="font-semibold mb-3">ผู้แพ้ / โรคประจำตัว</h4>
              {allergyList.length === 0 ? (
                <p className="text-gray-400">ไม่พบข้อมูล</p>
              ) : (
                <>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${showAllAllergies ? '' : 'max-h-72 overflow-hidden'} transition-all`}>
                    {filteredAllergies.slice(0, showAllAllergies ? filteredAllergies.length : 9).map((person, i) => (
                      <div key={i} className="border p-3 rounded-lg bg-linear-to-br from-orange-50 to-red-50">
                        <div className="font-medium text-gray-800 text-sm mb-2">{person.name}</div>
                        <div className="text-xs space-y-1">
                          {person.allergies.length > 0 && (
                            <div className="bg-white p-2 rounded">
                              <div className="font-semibold text-orange-600">🍽️ แพ้</div>
                              <div className="mt-1 text-gray-700">{person.allergies.join(', ')}</div>
                            </div>
                          )}
                          {person.medical.length > 0 && (
                            <div className="bg-white p-2 rounded">
                              <div className="font-semibold text-red-600">⚕️ โรค</div>
                              <div className="mt-1 text-gray-700">{person.medical.join(', ')}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => setShowAllAllergies((s) => !s)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showAllAllergies ? 'ย่อ' : `ดูทั้งหมด (${filteredAllergies.length})`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

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
