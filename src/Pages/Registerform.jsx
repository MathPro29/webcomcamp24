import React, { useState } from "react";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        phone: "",
        email: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        // ตรวจสอบค่าว่าง
        const { name, school, phone, email } = formData;
        if (!name || !school || !phone || !email) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งนะครับ 💛");
            return;
        }

        // แทนที่จะ alert สามารถส่ง API ได้ เช่น:
        // fetch("/api/register", { method: "POST", body: JSON.stringify(formData) })

        setSubmitted(true);
    };

    return (
        <section
            id="register"
            className="bg-[#101330] py-16 sm:py-20 text-white relative overflow-hidden min-h-screen"
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 relative z-10 mt-10">
                
                <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    สมัครเข้าร่วม Comcamp 24<sup className="text-amber-300">th</sup>
                </h2>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                    เตรียมตัวให้พร้อมสำหรับประสบการณ์ที่จะเปลี่ยนชีวิตคุณ 💫
                </p>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="bg-gradient-to-br from-[#1A1E4A] to-[#151838] p-8 sm:p-10 rounded-3xl shadow-2xl border border-yellow-400/40 hover:border-yellow-400/70 hover:shadow-yellow-400/20 transition-all duration-500 backdrop-blur-sm">
                    {!submitted ? (
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <span className="text-yellow-400">👤</span> ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="เช่น นายสมชาย ใจดี"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none transition-all group-hover:border-gray-500"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <span className="text-yellow-400">🏫</span> โรงเรียน
                                </label>
                                <input
                                    type="text"
                                    name="school"
                                    placeholder="เช่น โรงเรียนแม่โจ้"
                                    value={formData.school}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none transition-all group-hover:border-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="text-yellow-400">📱</span> เบอร์โทรศัพท์
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="0991234567"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none transition-all group-hover:border-gray-500"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="text-yellow-400">📧</span> อีเมล
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none transition-all group-hover:border-gray-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#101330] font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-400 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300 cursor-pointer text-lg"
                            >
                                ✨ ส่งแบบฟอร์มลงทะเบียน
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-8">
                            <div className="inline-block p-4 bg-yellow-400/20 rounded-full mb-4">
                                <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                                ส่งข้อมูลเรียบร้อย!
                            </h3>
                            <p className="text-gray-300 text-lg max-w-md mx-auto">
                                ขอบคุณที่ลงทะเบียนเข้าค่ายนะครับ 💛<br />
                                ทีมงานจะติดต่อกลับภายในไม่กี่วัน
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#101330] rounded-xl font-bold hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/30 transition-all"
                            >
                                ส่งอีกครั้ง
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-500/10 blur-3xl"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
        </section>
    );
};

export default RegisterForm;