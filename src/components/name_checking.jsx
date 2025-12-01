import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios"; // เพิ่มบรรทัดนี้

const NameChecking = () => {
  const [query, setQuery] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);   // เพิ่ม loading
  const [error, setError] = useState(null);       // เพิ่ม error


  // สร้าง Axios instance
  const api = axios.create({
    baseURL: import.meta.env.DEV
      ? "http://localhost:5000"   // dev รันแยกพอร์ต
      : "",                       // production ใช้ path เดียวกัน
    timeout: 10000,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/api/users"); // ใช้ axios แทน fetch

        const formatted = res.data.map((u) => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          school: u.school || "ไม่ระบุโรงเรียน",
          grade: u.grade || "ไม่ระบุชั้นปี",
          status: u.status || "รอตรวจสอบ", // สำคัญ!
        }));

        setApplicants(formatted);
        console.log("โหลดข้อมูลสำเร็จ:", formatted);
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
        setError("ไม่สามารถโหลดรายชื่อได้ ขณะนี้เซิร์ฟเวอร์กำลังปรับปรุง");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = query.trim() === ""
    ? applicants
    : applicants.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

  const statusColor = {
    "success": "text-green-400",
    "pending": "text-yellow-400",
    "declined": "text-red-400",
  };

  return (
    <section id="name_checking" className="bg-[#101330] py-12 sm:py-16 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm font-semibold text-yellow-400">
            ตรวจสอบรายชื่อ
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
            ค้นหารายชื่อผู้สมัครเข้าค่าย ComCamp 24<sup>th</sup>
          </h2>
          <p className="mt-2 text-gray-300">
            พิมพ์ชื่อ-นามสกุล เพื่อค้นหารายชื่อของในระบบ
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ-นามสกุล เช่น สมชาย ใจดี"
              className="w-full rounded-lg border border-gray-600 bg-[#1a1d3b] pl-10 pr-4 py-3
                     focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white
                     placeholder-gray-400"
            />
          </div>
        </div>

        {/* Loading / Error / Empty */}
        <div className="max-w-6xl mx-auto">
          {loading && (
            <p className="text-center text-yellow-400 py-10">
              กำลังโหลดรายชื่อผู้สมัคร...
            </p>
          )}

          {error && (
            <p className="text-center text-red-400 py-10 bg-red-900/20 rounded-lg">
              {error}
            </p>
          )}

          {/* ยังไม่มีข้อมูลในระบบ */}
          {!loading && !error && applicants.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-lg">
              ยังไม่พบผู้สมัคร
            </p>
          )}

          {/* มีข้อมูล แต่ค้นหาไม่เจอ */}
          {!loading && !error && applicants.length > 0 && filtered.length === 0 && (
            <p className="text-center text-gray-400 italic py-10 text-lg">
              ไม่พบรายชื่อที่ตรงกับคำค้น
            </p>
          )}

          {/* Table Scroll */}
          {!loading && !error && filtered.length > 0 && (
            <div className="max-h-[500px] overflow-y-auto border border-gray-700 rounded-lg">
              <table className="min-w-full text-sm sm:text-base border-collapse">
                <thead className="bg-[#1a1d3b] sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-300">ลำดับ</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-300">ชื่อ-นามสกุล</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-300">โรงเรียน</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-300">ชั้นปี</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-300">สถานะ</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((person, index) => (
                    <tr
                      key={person.id}
                      className="hover:bg-[#232757] transition-all border-b border-gray-700"
                    >
                      <td className="py-4 px-6">{index + 1}</td>
                      <td className="py-4 px-6 font-medium">{person.name}</td>
                      <td className="py-4 px-6 text-gray-300">{person.school}</td>
                      <td className="py-4 px-6 text-gray-300">{person.grade}</td>
                      <td className={`py-4 px-6 font-bold ${statusColor[person.status] || "text-gray-500"}`}>
                        {person.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>

  );
};

export default NameChecking;