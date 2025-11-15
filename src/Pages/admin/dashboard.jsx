import React from 'react';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">
                Dashboard Overviews
            </h1>

            {/* ตัวอย่าง Card ข้อมูล */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500">
                    <p className="text-sm text-gray-500">ผู้สมัครทั้งหมด</p>
                    <p className="text-3xl font-semibold text-gray-900">1,250</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500">
                    <p className="text-sm text-gray-500">กำลังตรวจสอบ</p>
                    <p className="text-3xl font-semibold text-gray-900">45</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-500">รอแก้ไข</p>
                    <p className="text-3xl font-semibold text-gray-900">5</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">ค้างชำระเงิน</p>
                    <p className="text-3xl font-semibold text-gray-900">3</p>
                </div>
                {/* ... เพิ่ม Card อื่นๆ */}
            </div>

            {/* ส่วนอื่นๆ เช่น กราฟ หรือตารางล่าสุด */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">รายชื่อผู้สมัครทั้งหมด</h2>
                {/* ... เพิ่มตารางกิจกรรมล่าสุด */}
                <div className="h-64 flex items-center justify-center text-gray-400">
                    [ Placeholder สำหรับตารางหรือกราฟ ]
                </div>
            </div>

        </div>
    );
}