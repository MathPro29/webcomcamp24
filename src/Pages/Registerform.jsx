import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        prefix: "",
        firstName: "",
        lastName: "",
        nickname: "",
        birthDate: "",
        age: "",
        gender: "",
        school: "",
        grade: "",
        province: "",
        phone: "",
        parentPhone: "",
        email: "",
        lineId: "",
        shirtSize: "",
        allergies: "",
        medicalConditions: "",
        emergencyContact: "",
        emergencyPhone: "",
        motivation: "",
        expectations: "",
    });

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [direction, setDirection] = useState(0); // +1 next, -1 back (for slide direction)
    const totalSteps = 4;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const validateStep = (currentStep = step) => {
        const newErrors = {};

        // if (currentStep === 1) {
        //     if (!formData.prefix) newErrors.prefix = "กรุณาเลือกคำนำหน้า";
        //     if (!formData.firstName) newErrors.firstName = "กรุณากรอกชื่อ";
        //     if (!formData.lastName) newErrors.lastName = "กรุณากรอกนามสกุล";
        //     if (!formData.nickname) newErrors.nickname = "กรุณากรอกชื่อเล่น";
        //     if (!formData.birthDate) newErrors.birthDate = "กรุณาเลือกวันเกิด";
        //     if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ";
        // }
        // if (currentStep === 2) {
        //     if (!formData.school) newErrors.school = "กรุณากรอกชื่อโรงเรียน";
        //     if (!formData.grade) newErrors.grade = "กรุณาเลือกระดับชั้น";
        //     if (!formData.province) newErrors.province = "กรุณากรอกจังหวัด";
        // }
        // if (currentStep === 3) {
        //     if (!formData.phone) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
        //     if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
        //     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        //         newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        //     }
        //     if (!formData.emergencyContact) newErrors.emergencyContact = "กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน";
        //     if (!formData.emergencyPhone) newErrors.emergencyPhone = "กรุณากรอกเบอร์ผู้ติดต่อฉุกเฉิน";
        // }
        // if (currentStep === 4) {
        //     if (!formData.shirtSize) newErrors.shirtSize = "กรุณาเลือกไซส์เสื้อ";
        //     if (!formData.motivation) newErrors.motivation = "กรุณากรอกเหตุผลที่สมัคร";
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const next = () => {
        if (validateStep()) {
            setDirection(1);
            setStep((s) => Math.min(totalSteps, s + 1));
        }
    };

    const back = () => {
        setDirection(-1);
        setStep((s) => Math.max(1, s - 1));
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        const requiredFields = ['prefix', 'firstName', 'lastName', 'nickname', 'birthDate', 'gender',
            'school', 'grade', 'province', 'phone', 'email',
            'emergencyContact', 'emergencyPhone', 'shirtSize', 'motivation'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert("กรุณากรอกข้อมูลให้ครบทุกช่องที่จำเป็นก่อนส่งนะครับ 💛");
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดขณะส่งข้อมูล ลองอีกครั้งครับ");
        }
    };

    const progressPercent = Math.round(((step - 1) / (totalSteps - 1)) * 100);

    // motion variants which use custom direction (custom prop)
    const variants = {
        enter: (dir) => ({
            x: dir > 0 ? 120 : -120,
            opacity: 0,
            scale: 0.99,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? -120 : 120,
            opacity: 0,
            scale: 0.99,
        }),
    };

    const buttonHover = { scale: 1.02, y: -3 };
    const buttonTap = { scale: 0.98, y: 0 };

    return (
        <section id="register" className="bg-[#101330] py-16 sm:py-20 text-white relative overflow-hidden min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 relative z-10 mt-10">
                <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    สมัครเข้าร่วม Comcamp 24<sup className="text-amber-300">th</sup>
                </h2>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">เตรียมตัวให้พร้อมสำหรับประสบการณ์ที่จะเปลี่ยนชีวิตคุณ 💫</p>
            </div>

            <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="bg-gradient-to-br from-[#1A1E4A] to-[#151838] p-8 sm:p-10 rounded-3xl shadow-2xl border border-yellow-400/40 transition-all duration-500 backdrop-blur-sm">

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2 text-sm text-gray-300">
                            <div>หน้าที่ {step} / {totalSteps}</div>
                            <div>{progressPercent}%</div>
                        </div>
                        <div className="w-full bg-[#0d1028] rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="h-2 rounded-full shadow-sm"
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                                style={{ background: 'linear-gradient(90deg,#FDE68A,#F59E0B)' }}
                            />
                        </div>
                    </div>

                    {!submitted ? (
                        <div className="space-y-6">
                            <AnimatePresence custom={direction} exitBeforeEnter initial={false}>
                                {/* Wrap each step content in a motion.div keyed by step */}
                                {step === 1 && (
                                    <motion.div

                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">📝 ข้อมูลส่วนตัว</h3>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">คำนำหน้า <span className="text-red-400">*</span></label>
                                            <select name="prefix" value={formData.prefix} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.prefix ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                <option value="" disabled>เลือกคำนำหน้า</option>
                                                <option value="นาย">นาย</option>
                                                <option value="นางสาว">นางสาว</option>
                                                <option value="เด็กชาย">เด็กชาย</option>
                                                <option value="เด็กหญิง">เด็กหญิง</option>
                                            </select>
                                            {errors.prefix && <p className="text-red-400 text-xs mt-1">{errors.prefix}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">👤 ชื่อ <span className="text-red-400">*</span></label>
                                                <input type="text" name="firstName" placeholder="เช่น สมชาย" value={formData.firstName} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.firstName ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">👤 นามสกุล <span className="text-red-400">*</span></label>
                                                <input type="text" name="lastName" placeholder="เช่น ใจดี" value={formData.lastName} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.lastName ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">😊 ชื่อเล่น <span className="text-red-400">*</span></label>
                                            <input type="text" name="nickname" placeholder="เช่น ออก้า" value={formData.nickname} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.nickname ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                            {errors.nickname && <p className="text-red-400 text-xs mt-1">{errors.nickname}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">🎂 วันเกิด <span className="text-red-400">*</span></label>
                                                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.birthDate ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.birthDate && <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">👶 อายุ</label>
                                                <input type="number" min="0" max="25" name="age" placeholder="เช่น 16" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none" />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">⚧️ เพศ <span className="text-red-400">*</span></label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.gender ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                <option value="" disabled>เลือกเพศ</option>
                                                <option value="ชาย">ชาย</option>
                                                <option value="หญิง">หญิง</option>
                                                <option value="ไม่ระบุ">ไม่ระบุ</option>
                                            </select>
                                            {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div

                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">🎓 ข้อมูลการศึกษา</h3>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">🏫 ชื่อโรงเรียน <span className="text-red-400">*</span></label>
                                            <input type="text" name="school" placeholder="เช่น โรงเรียนแม่โจ้" value={formData.school} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.school ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                            {errors.school && <p className="text-red-400 text-xs mt-1">{errors.school}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">📚 ระดับชั้น <span className="text-red-400">*</span></label>
                                                <select name="grade" value={formData.grade} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.grade ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                    <option value="" disabled>เลือกระดับชั้น</option>
                                                    <option value="ม.1">มัธยมศึกษาปีที่ 1</option>
                                                    <option value="ม.2">มัธยมศึกษาปีที่ 2</option>
                                                    <option value="ม.3">มัธยมศึกษาปีที่ 3</option>
                                                    <option value="ม.4">มัธยมศึกษาปีที่ 4</option>
                                                    <option value="ม.5">มัธยมศึกษาปีที่ 5</option>
                                                    <option value="ม.6">มัธยมศึกษาปีที่ 6</option>
                                                </select>
                                                {errors.grade && <p className="text-red-400 text-xs mt-1">{errors.grade}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">📍 จังหวัด <span className="text-red-400">*</span></label>
                                                <input type="text" name="province" placeholder="เช่น เชียงใหม่" value={formData.province} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.province ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.province && <p className="text-red-400 text-xs mt-1">{errors.province}</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div

                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">📞 ข้อมูลการติดต่อ</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">📱 เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
                                                <input type="tel" name="phone" placeholder="0812345678" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.phone ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">📞 เบอร์ผู้ปกครอง</label>
                                                <input type="tel" name="parentPhone" placeholder="0898765432" value={formData.parentPhone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none" />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">📧 อีเมล <span className="text-red-400">*</span></label>
                                            <input type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.email ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">💬 LINE ID</label>
                                            <input type="text" name="lineId" placeholder="your_line_id" value={formData.lineId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none" />
                                        </div>

                                        <div className="border-t border-gray-700 pt-4 mt-6">
                                            <h4 className="text-lg font-semibold text-yellow-400 mb-3">🚨 ข้อมูลฉุกเฉิน</h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">👤 ผู้ติดต่อฉุกเฉิน <span className="text-red-400">*</span></label>
                                                    <input type="text" name="emergencyContact" placeholder="ชื่อผู้ปกครอง/ญาติ" value={formData.emergencyContact} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.emergencyContact ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                    {errors.emergencyContact && <p className="text-red-400 text-xs mt-1">{errors.emergencyContact}</p>}
                                                </div>

                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">📞 เบอร์ฉุกเฉิน <span className="text-red-400">*</span></label>
                                                    <input type="tel" name="emergencyPhone" placeholder="0812345678" value={formData.emergencyPhone} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.emergencyPhone ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                    {errors.emergencyPhone && <p className="text-red-400 text-xs mt-1">{errors.emergencyPhone}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div

                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">✨ ข้อมูลเพิ่มเติม</h3>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">👕 ไซส์เสื้อ <span className="text-red-400">*</span></label>
                                            <select name="shirtSize" value={formData.shirtSize} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.shirtSize ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                <option value="" disabled>เลือกไซส์เสื้อ</option>
                                                <option value="XS">XS</option>
                                                <option value="S">S</option>
                                                <option value="M">M</option>
                                                <option value="L">L</option>
                                                <option value="XL">XL</option>
                                                <option value="XXL">XXL</option>
                                                <option value="3XL">3XL</option>
                                            </select>
                                            {errors.shirtSize && <p className="text-red-400 text-xs mt-1">{errors.shirtSize}</p>}
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">🍽️ อาหารที่แพ้ / ข้อจำกัดด้านอาหาร</label>
                                            <textarea name="allergies" rows="2" placeholder="เช่น แพ้กุ้ง, แพ้นม" value={formData.allergies} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none resize-none" />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">💊 โรคประจำตัว / ข้อมูลสุขภาพที่ควรทราบ</label>
                                            <textarea name="medicalConditions" rows="2" placeholder="เช่น โรคหอบหืด" value={formData.medicalConditions} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none resize-none" />
                                        </div>

                                        <div className="border-t border-gray-700 pt-4 mt-6">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">💡 เหตุผลที่อยากเข้าค่าย Comcamp <span className="text-red-400">*</span></label>
                                                <textarea name="motivation" rows="4" placeholder="บอกเราสักหน่อยว่าทำไมถึงอยากเข้าค่าย" value={formData.motivation} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.motivation ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none resize-none`} />
                                                {errors.motivation && <p className="text-red-400 text-xs mt-1">{errors.motivation}</p>}
                                            </div>

                                            <div className="group mt-4">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">🎯 คุณคาดหวังอะไรจากค่ายนี้</label>
                                                <textarea name="expectations" rows="3" placeholder="เช่น อยากเรียนรู้การเขียนโปรแกรม" value={formData.expectations} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none resize-none" />
                                            </div>
                                        </div>

                                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mt-4">
                                            <p className="text-sm text-gray-300">💡 <span className="font-semibold text-yellow-400">หมายเหตุ:</span> กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนส่งแบบฟอร์มนะครับ</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div className="text-center py-12" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 70 }}>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-yellow-400 mb-2">ยินดีด้วย!</h2>
                            <p className="text-gray-300 mb-6">เราได้รับแบบฟอร์มของคุณแล้ว ขอบคุณที่สนใจเข้าร่วม Comcamp 24</p>
                            <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => window.location.href = "/"} className="px-6 py-2 bg-yellow-400 text-[#101330] font-semibold rounded-lg hover:bg-yellow-300 transition">กลับไปหน้าแรก</motion.button>
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    {!submitted && (
                        <div className="flex gap-4 mt-8">
                            <motion.button
                                onClick={back}
                                initial={false}
                                animate={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? "none" : "auto" }}
                                transition={{ duration: 0.2 }}
                                className="cursor-pointer flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                style={{ display: step === 1 ? "none" : "inline-flex" }}
                            >
                                ← ย้อนกลับ
                            </motion.button>

                            {step < totalSteps ? (
                                <motion.button onClick={next} whileHover={buttonHover} whileTap={buttonTap} className="cursor-pointer flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#101330] font-semibold rounded-xl shadow">
                                    ถัดไป →
                                </motion.button>
                            ) : (
                                <motion.button onClick={handleSubmit} whileHover={buttonHover} whileTap={buttonTap} className="cursor-pointer flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow">
                                    ส่งแบบฟอร์ม
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* subtle background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-500/10 blur-3xl pointer-events-none"></div>
        </section>
    );
}

