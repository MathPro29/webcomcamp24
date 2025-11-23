import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const NameChecking = () => {
  const [query, setQuery] = useState("");
  const [applicants, setApplicants] = useState([]);

  // 🟦 ดึงข้อมูลจาก API เมื่อโหลดหน้า
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users"); // << เรียก backend
        const data = await res.json();

        // 🟩 map ข้อมูลจาก MongoDB ให้เป็นแบบที่ frontend ใช้
        const formatted = data.map((u, i) => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          school: u.school,
        }));

        setApplicants(formatted);
      } catch (err) {
        console.log("Error loading users:", err);
      }
    };

    fetchUsers();
  }, []);

  // 🔍 ค้นชื่อ
  const filtered =
    query.trim() === ""
      ? applicants
      : applicants.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );

  // สีสถานะ
  const statusColor = {
    ผ่านการสมัคร: "text-green-400",
    รอตรวจสอบ: "text-yellow-400",
    ไม่ผ่านการสมัคร: "text-red-400",
  };

  return (
    <section id="name_checking" className="bg-[#101330] py-12 sm:py-16 text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
        <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm sm:text-base font-semibold text-yellow-400">
          ตรวจสอบรายชื่อ
        </span>
        <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold">
          ค้นหารายชื่อผู้สมัครเข้าค่าย ComCamp24<sup>th</sup>
        </h2>
        <p className="mt-2 text-gray-300 text-sm sm:text-base">
          พิมพ์ชื่อ-นามสกุล เพื่อค้นหารายชื่อของคุณในระบบ
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔎 พิมพ์ชื่อ-นามสกุล เช่น สมชาย ใจดี"
            className="w-full rounded-lg border border-gray-600 bg-[#1a1d3b] pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#e28d0d] focus:border-[#e28d0d] text-gray-200 placeholder-gray-400 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 italic mt-6">
            ❌ ไม่พบรายชื่อที่ตรงกับคำค้น
          </p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-700 text-sm sm:text-base">
            <thead className="bg-[#1a1d3b] border-b border-gray-600">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-300">
                  ลำดับ
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300">
                  ชื่อ-นามสกุล
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300">
                  โรงเรียน
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person, index) => (
                <tr
                  key={person.id}
                  className="hover:bg-[#232757] transition-all border-b border-gray-700"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{person.name}</td>
                  <td className="py-3 px-4 text-gray-300">{person.school}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${statusColor[person.status] || "text-gray-300"
                      }`}
                  >
                    {person.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default NameChecking;
