import React, { useState } from "react";
import { ChevronDown } from "lucide-react";


const Qanda = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const qna = [
        {
            q: "ค่ายนี้เปิดรับสมัครช่วงไหน?",
            a: "โดยทั่วไปจะเปิดรับสมัครช่วงเดือนพฤศจิกายนถึงธันวาคมของทุกปี ติดตามได้ทางเพจหลักของค่ายครับ",
        },
        {
            q: "ต้องมีพื้นฐานด้านวิทยาศาสตร์ไหมถึงจะสมัครได้?",
            a: "ไม่จำเป็นครับ! ค่ายของเราเปิดรับทุกคนที่มีความสนใจและอยากเรียนรู้ ไม่ว่าจะมีพื้นฐานหรือไม่ก็ตาม",
        },
        {
            q: "มีกิจกรรมอะไรบ้างในค่าย?",
            a: "มีกิจกรรมทั้งด้านวิชาการและสันทนาการ เช่น เวิร์กช็อป การแข่งขันกลุ่ม เกมละลายพฤติกรรม และกิจกรรมกลางคืนสุดสนุก!",
        },
        {
            q: "ต้องพักค้างคืนไหม?",
            a: "ใช่ครับ ค่ายนี้เป็นค่ายพักค้าง 3 วัน 2 คืน มีที่พักและอาหารให้พร้อมตลอดงาน",
        },
        {
            q: "ในค่ายมีคนดำไหมคะ หนูกัว?",
            a: "ไม่ต้องกังวลไปครับ ค่ายของเราเน้นความปลอดภัยและความสบายใจของผู้เข้าร่วมเป็นหลัก มีเจ้าหน้าที่ดูแลตลอดเวลา",
        },
    ];

    return (
        <section
            id="qanda"
            className="bg-[#101330] py-16 sm:py-20 text-white overflow-hidden"
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm sm:text-base font-semibold text-yellow-400">
                    Q&A คำถามที่พบบ่อย
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    รวมคำถามที่น้องๆ มักสงสัย
                </h2>
            </div>

            {/* Q&A List */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {qna.map((item, index) => (
                    <div
                        key={index}
                        className={`border border-yellow-400/40 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? "bg-yellow-400/10" : "bg-[#14173d]"
                            }`}
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-yellow-300 hover:text-yellow-200 transition-all"
                        >
                            <span>{item.q}</span>
                            <ChevronDown
                                className={`w-5 h-5 transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        <div
                            className={`px-6 pb-4 text-green-300 text-sm sm:text-base transition-all duration-300 ${openIndex === index
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0 overflow-hidden"
                                }`}
                        >
                            {item.a}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Qanda;
