import React, { useState } from "react";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        phone: "",
        email: "",
        reason: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // ตรวจสอบค่าว่าง
        const { name, school, phone, email, reason } = formData;
        if (!name || !school || !phone || !email || !reason) {
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
            className="bg-[#101330] py-16 sm:py-20 text-white relative overflow-hidden"
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 relative z-10">
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-yellow-300">
                    สมัครเข้าร่วม CAMP 24th ได้ที่นี่!
                </h2>
                <p className="mt-2 text-gray-300">กรอกข้อมูลให้ครบถ้วนก่อนส่งนะครับ 💫</p>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto bg-[#1A1E4A] p-8 rounded-2xl shadow-xl border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-500 relative z-10">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                ชื่อ-นามสกุล
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="เช่น นายสมชาย ใจดี"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-[#12163A] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/30 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">โรงเรียน</label>
                            <input
                                type="text"
                                name="school"
                                placeholder="เช่น โรงเรียนแม่โจ้"
                                value={formData.school}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-[#12163A] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/30 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="0991234567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-[#12163A] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/30 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-[#12163A] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/30 focus:outline-none transition-all"
                                />
                            </div>
                        </div>


                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-400 text-[#101330] font-semibold rounded-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 shadow-md"
                        >
                            ส่งแบบฟอร์มลงทะเบียน
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-3">
                        <h3 className="text-2xl font-semibold text-yellow-400">
                            ✅ ส่งข้อมูลเรียบร้อย!
                        </h3>
                        <p className="text-gray-300">
                            ขอบคุณที่ลงทะเบียนเข้าค่ายนะครับ ทีมงานจะติดต่อกลับภายในไม่กี่วัน 💛
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-4 px-6 py-2 bg-yellow-400 text-[#101330] rounded-lg font-semibold hover:bg-yellow-300 transition-all"
                        >
                            ส่งอีกครั้ง
                        </button>
                    </div>
                )}
            </div>

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-transparent to-yellow-500/10 blur-3xl"></div>
        </section>
    );
};

export default RegisterForm;
