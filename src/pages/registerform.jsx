import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import { notify } from "../utils/toast";

export default function RegisterForm() {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://202.28.37.166:5000';

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
        laptop: "",
    });

    // Date object for react-datepicker
    const [birthDateObj, setBirthDateObj] = useState(null);

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [direction, setDirection] = useState(0); // +1 next, -1 back (for slide direction)
    const totalSteps = 4;

    // Registration status
    const [registrationStatus, setRegistrationStatus] = useState({
        isOpen: true,
        currentCount: 0,
        maxCapacity: 100,
        loading: true
    });

    // Check registration status on mount
    useEffect(() => {
        checkRegistrationStatus();
    }, []);

    const checkRegistrationStatus = async () => {
        try {
            // Fetch settings
            const settingsRes = await axios.get(`${API_BASE}/api/settings`);
            const settings = settingsRes.data;

            // Fetch current user count
            const usersRes = await axios.get(`${API_BASE}/api/users/all`);
            const currentCount = usersRes.data.length;

            setRegistrationStatus({
                isOpen: settings.isRegistrationOpen,
                currentCount: currentCount,
                maxCapacity: settings.maxCapacity,
                loading: false
            });

            // Show warning if registration is closed or full
            if (!settings.isRegistrationOpen) {
                notify.error('ขณะนี้ปิดรับสมัครแล้ว');
            } else if (currentCount >= settings.maxCapacity) {
                notify.error('ขออภัย! จำนวนผู้สมัครเต็มแล้ว');
            }
        } catch (error) {
            console.error('Error checking registration status:', error);
            setRegistrationStatus(prev => ({ ...prev, loading: false }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // format phone-like fields as XXX-XXX-XXXX while typing
        if (name === 'phone' || name === 'parentPhone' || name === 'emergencyPhone') {
            const cleaned = value.replace(/\D/g, '').slice(0, 10);
            let formatted = cleaned;
            if (cleaned.length > 6) formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            else if (cleaned.length > 3) formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
            setFormData((s) => ({ ...s, [name]: formatted }));
            return;
        }

        // Prevent negative numbers for age field
        if (name === 'age') {
            const numValue = parseInt(value, 10);
            if (value === '' || (numValue >= 0 && numValue <= 99)) {
                setFormData((s) => ({ ...s, [name]: value }));
            }
            return;
        }

        setFormData((s) => ({ ...s, [name]: value }));
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.prefix) newErrors.prefix = "กรุณาเลือกคำนำหน้า";
            if (!formData.firstName) newErrors.firstName = "กรุณากรอกชื่อ";
            if (!formData.lastName) newErrors.lastName = "กรุณากรอกนามสกุล";
            if (!formData.nickname) newErrors.nickname = "กรุณากรอกชื่อเล่น";
            if (!formData.birthDate) newErrors.birthDate = "กรุณาเลือกวันเกิด";
            if (!formData.age) newErrors.age = "กรุณากรอกอายุ";
            if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ";
        }
        if (step === 2) {
            if (!formData.school) newErrors.school = "กรุณากรอกชื่อโรงเรียน";
            if (!formData.grade) newErrors.grade = "กรุณาเลือกระดับชั้น";
            if (!formData.province) newErrors.province = "กรุณากรอกจังหวัด";
        }
        if (step === 3) {
            if (!formData.phone) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
            if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
            if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
            }
            if (!formData.emergencyContact) newErrors.emergencyContact = "กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน";
            if (!formData.emergencyPhone) newErrors.emergencyPhone = "กรุณากรอกเบอร์ผู้ติดต่อฉุกเฉิน";
        }
        if (step === 4) {
            if (!formData.shirtSize) newErrors.shirtSize = "กรุณาเลือกไซส์เสื้อ";
            if (!formData.laptop) newErrors.laptop = "กรุณาเลือกว่ามีโน๊ตบุ๊คหรือไม่";
        }

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
        const requiredFields = [
            "prefix", "firstName", "lastName", "nickname", "birthDate", "age", "gender",
            "school", "grade", "province", "phone", "email",
            "emergencyContact", "emergencyPhone", "shirtSize"
        ];

        const missing = requiredFields.filter(f => !formData[f]);
        if (missing.length > 0) {
            notify.warn("กรุณากรอกข้อมูลให้ครบทุกช่องที่จำเป็นก่อนส่งนะครับ");
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                phone: (formData.phone || '').replace(/-/g, ''),
                parentPhone: (formData.parentPhone || '').replace(/-/g, ''),
                emergencyPhone: (formData.emergencyPhone || '').replace(/-/g, ''),
                birthDate: birthDateObj ? format(birthDateObj, 'yyyy-MM-dd') : formData.birthDate,
                status: "pending",
            };

            const res = await axios.post(`${API_BASE}/api/register`, dataToSend);

            console.log("สมัครสำเร็จ!", res.data);
            notify.success('สมัครสำเร็จ! ขอบคุณที่สมัครเข้าร่วม ค่ายComcamp 24th');
            setSubmitted(true);

        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                notify.error("อีเมลนี้ถูกใช้สมัครไปแล้ว!");
            } else {
                notify.error(err.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
            }
        }
    };

    const progressPercent = Math.round(((step - 1) / (totalSteps - 1)) * 100);

    // motion variants were removed (not used currently)

    const buttonHover = { scale: 1.02, y: -3 };
    const buttonTap = { scale: 0.98, y: 0 };

    return (
        <section id="register" className="bg-[#101330] py-16 sm:py-20 text-white relative overflow-hidden min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 relative z-10 mt-10">
                <h2 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    สมัครเข้าร่วมค่าย Comcamp 24<sup className="text-amber-300">th</sup>
                </h2>
            </div>

            <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="bg-linear-to-br from-[#1A1E4A] to-[#151838] p-8 sm:p-10 rounded-3xl shadow-2xl border border-yellow-400/40 transition-all duration-500 backdrop-blur-sm">

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2 text-sm text-gray-300">
                            <div>หน้าที่ {step} / {totalSteps}</div>
                            <div>{progressPercent}%</div>
                        </div>
                        <div className="w-full bg-[#0d1028] rounded-full h-2 overflow-hidden">
                            <Motion.div
                                className="h-2 rounded-full shadow-sm"
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                                style={{ background: 'linear-gradient(90deg,#FDE68A,#F59E0B)' }}
                            />
                        </div>
                    </div>

                    {/* Registration Status Warning */}
                    {!registrationStatus.loading && (!registrationStatus.isOpen || registrationStatus.currentCount >= registrationStatus.maxCapacity) && (
                        <div className="mb-6 p-6 bg-red-500/20 border-2 border-red-500 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-3xl">🚫</div>
                                <h3 className="text-xl font-bold text-red-400">
                                    {!registrationStatus.isOpen ? 'ปิดรับสมัครแล้ว' : 'จำนวนผู้สมัครเต็มแล้ว'}
                                </h3>
                            </div>
                            <p className="text-gray-300 ml-12">
                                {!registrationStatus.isOpen ? (
                                    <>
                                        ขณะนี้ระบบปิดรับสมัครชั่วคราว กรุณาติดตามข่าวสารเพิ่มเติมทางช่องทาง{" "}
                                        <a
                                            href="https://www.facebook.com/CCCSMJU"
                                            target="_blank"
                                            className="text-blue-400 underline"
                                        >
                                            Facebook Comcamp
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        ขออภัย! จำนวนผู้สมัครเต็มแล้ว ({registrationStatus.currentCount}/{registrationStatus.maxCapacity} คน)
                                    </>
                                )}
                            </p>

                        </div>
                    )}

                    {!submitted ? (
                        <div className="space-y-6">
                            <AnimatePresence custom={direction} exitBeforeEnter initial={false}>
                                {/* Wrap each step content in a motion.div keyed by step */}
                                {step === 1 && (
                                    <Motion.div
                                        className={!registrationStatus.isOpen || registrationStatus.currentCount >= registrationStatus.maxCapacity ? 'opacity-50 pointer-events-none' : ''}
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
                                                <label className="block text-sm font-medium text-gray-300 mb-2">ชื่อ <span className="text-red-400">*</span></label>
                                                <input type="text" name="firstName" placeholder="ชื่อ" value={formData.firstName} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.firstName ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">นามสกุล <span className="text-red-400">*</span></label>
                                                <input type="text" name="lastName" placeholder="นามสกุล" value={formData.lastName} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.lastName ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">ชื่อเล่น <span className="text-red-400">*</span></label>
                                            <input type="text" name="nickname" placeholder="ชื่อเล่น" value={formData.nickname} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.nickname ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                            {errors.nickname && <p className="text-red-400 text-xs mt-1">{errors.nickname}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">วันเกิด <span className="text-red-400">*</span></label>
                                                <div className="w-full">
                                                    <DatePicker
                                                        selected={birthDateObj}
                                                        onChange={(date) => {
                                                            setBirthDateObj(date);
                                                            setFormData(s => ({ ...s, birthDate: date ? format(date, 'dd/MM/yyyy') : '' }));
                                                        }}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="เลือกวันเกิด"
                                                        showYearDropdown
                                                        showMonthDropdown
                                                        dropdownMode="select"
                                                        yearDropdownItemNumber={100}
                                                        scrollableYearDropdown
                                                        maxDate={new Date()}
                                                        className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.birthDate ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}
                                                    />
                                                </div>
                                                {errors.birthDate && <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">อายุ<span className="text-red-400">*</span></label>
                                                <input
                                                    required
                                                    type="number"
                                                    min="0"
                                                    max="99"
                                                    name="age"
                                                    placeholder="อายุ"
                                                    value={formData.age}
                                                    onChange={handleChange}
                                                    onKeyDown={(e) => {
                                                        // Prevent minus, plus, e, E keys
                                                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onWheel={(e) => e.target.blur()}
                                                    className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.age ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}
                                                />
                                                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">เพศ <span className="text-red-400">*</span></label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.gender ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                <option value="" disabled>เลือกเพศ</option>
                                                <option value="ชาย">ชาย</option>
                                                <option value="หญิง">หญิง</option>
                                                <option value="ไม่ระบุ">ไม่ระบุ</option>
                                            </select>
                                            {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                                        </div>
                                    </Motion.div>
                                )}

                                {step === 2 && (
                                    <Motion.div
                                        className={!registrationStatus.isOpen || registrationStatus.currentCount >= registrationStatus.maxCapacity ? 'opacity-50 pointer-events-none' : ''}
                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">🎓 ข้อมูลการศึกษา</h3>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">ชื่อโรงเรียน/วิทยาลัย <span className="text-red-400">*</span></label>
                                            <input type="text" name="school" placeholder="เช่น โรงเรียน / วิทยาลัย" value={formData.school} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.school ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                            {errors.school && <p className="text-red-400 text-xs mt-1">{errors.school}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">ระดับชั้น <span className="text-red-400">*</span></label>
                                                <select name="grade" value={formData.grade} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.grade ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                    <option value="" disabled>เลือกระดับชั้น</option>
                                                    <option value="ม.4">มัธยมศึกษาปีที่ 4</option>
                                                    <option value="ม.5">มัธยมศึกษาปีที่ 5</option>
                                                    <option value="ม.6">มัธยมศึกษาปีที่ 6</option>
                                                    <option value="ปวช.1">ประกาศนียบัตรวิชาชีพปีที่ 1</option>
                                                    <option value="ปวช.2">ประกาศนียบัตรวิชาชีพปีที่ 2</option>
                                                    <option value="ปวช.3">ประกาศนียบัตรวิชาชีพปีที่ 3</option>
                                                </select>
                                                {errors.grade && <p className="text-red-400 text-xs mt-1">{errors.grade}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">จังหวัด <span className="text-red-400">*</span></label>
                                                <input type="text" name="province" placeholder="เช่น เชียงใหม่" value={formData.province} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.province ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.province && <p className="text-red-400 text-xs mt-1">{errors.province}</p>}
                                            </div>
                                        </div>
                                    </Motion.div>
                                )}

                                {step === 3 && (
                                    <Motion.div
                                        className={!registrationStatus.isOpen || registrationStatus.currentCount >= registrationStatus.maxCapacity ? 'opacity-50 pointer-events-none' : ''}
                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">📞 ข้อมูลการติดต่อ</h3>

                                        <div className="grid col-span-1 gap-4">
                                            <div className="group">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">เบอร์โทรศัพท์ส่วนตัว <span className="text-red-400">*</span></label>
                                                <input type="tel" name="phone" placeholder="เบอร์โทรศัพท์ส่วนตัว" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.phone ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                                            </div>


                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">อีเมล <span className="text-red-400">*</span></label>
                                            <input type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.email ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">LINE ID</label>
                                            <input type="text" name="lineId" placeholder="Line ID" value={formData.lineId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none" />
                                        </div>

                                        <div className="border-t border-gray-700 pt-4 mt-6">
                                            <h4 className="text-lg font-semibold text-yellow-400 mb-3">🚨 ข้อมูลฉุกเฉิน</h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">มีความเกี่ยวข้องเป็น <span className="text-red-400">*</span></label>
                                                    <input type="text" name="emergencyContact" placeholder="ชื่อผู้ปกครอง/ญาติ" value={formData.emergencyContact} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.emergencyContact ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                    {errors.emergencyContact && <p className="text-red-400 text-xs mt-1">{errors.emergencyContact}</p>}
                                                </div>

                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">เบอร์โทรศัพท์ฉุกเฉิน <span className="text-red-400">*</span></label>
                                                    <input type="tel" name="emergencyPhone" placeholder="เบอร์โทรศัพท์" value={formData.emergencyPhone} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.emergencyPhone ? 'border-red-400' : 'border-gray-600'} text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`} />
                                                    {errors.emergencyPhone && <p className="text-red-400 text-xs mt-1">{errors.emergencyPhone}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </Motion.div>
                                )}

                                {step === 4 && (
                                    <Motion.div
                                        className={!registrationStatus.isOpen || registrationStatus.currentCount >= registrationStatus.maxCapacity ? 'opacity-50 pointer-events-none' : ''}
                                    >
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">✨ ข้อมูลเพิ่มเติม</h3>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">ไซส์เสื้อ <span className="text-red-400">*</span></label>
                                            <select name="shirtSize" value={formData.shirtSize} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.shirtSize ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                <option value="" disabled>เลือกไซส์เสื้อ</option>
                                                <option value="S">S (รอบอก 32นิ้ว ยาว 24นิ้ว)</option>
                                                <option value="M">M (รอบอก 36นิ้ว ยาว 26นิ้ว)</option>
                                                <option value="L">L (รอบอก 40นิ้ว ยาว 28นิ้ว)</option>
                                                <option value="XL">XL (รอบอก 42นิ้ว ยาว 29นิ้ว)</option>
                                                <option value="2XL">2XL (รอบอก 44นิ้ว ยาว 29นิ้ว)</option>
                                                <option value="3XL">3XL (รอบอก 46นิ้ว ยาว 30นิ้ว)</option>
                                                <option value="4XL">4XL (รอบอก 48นิ้ว ยาว 30นิ้ว)</option>
                                            </select>
                                            {errors.shirtSize && <p className="text-red-400 text-xs mt-1">{errors.shirtSize}</p>}
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">อาหารที่แพ้</label>
                                            <textarea name="allergies" rows="2" placeholder="เช่น แพ้กุ้ง, แพ้นม หากไม่มีเว้นว่าง" value={formData.allergies} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none resize-none" />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">โรคประจำตัว</label>
                                            <textarea name="medicalConditions" rows="2" placeholder="เช่น โรคหอบหืด หากไม่มีเว้นว่าง" value={formData.medicalConditions} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-[#0D1028] border border-gray-600 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none resize-none" />
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">มีโน๊ตบุ๊คส่วนตัวหรือไม่<span className="text-red-400">*</span></label>
                                            <select name="laptop" value={formData.laptop} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl bg-[#0D1028] border ${errors.laptop ? 'border-red-400' : 'border-gray-600'} text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:outline-none`}>
                                                <option value="" disabled>มีโน๊ตบุ๊คส่วนตัวหรือไม่?</option>
                                                <option value="Yes">มี</option>
                                                <option value="No">ไม่มี</option>
                                            </select>
                                            {errors.laptop && <p className="text-red-400 text-xs mt-1">{errors.laptop}</p>}
                                        </div>



                                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mt-4">
                                            <p className="text-sm text-gray-300">💡 <span className="font-semibold text-yellow-400">หมายเหตุ:</span> กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนส่งแบบฟอร์มนะครับ</p>
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Motion.div className="text-center py-12" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 70 }}>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-yellow-400 mb-2">ยินดีด้วย!</h2>
                            <p className="text-gray-300 mb-6">เราได้รับแบบฟอร์มของคุณแล้ว ขอบคุณที่สนใจเข้าร่วม Comcamp 24</p>
                            <Motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => window.location.href = "/"} className="px-6 py-2 bg-yellow-400 text-[#101330] font-semibold rounded-lg hover:bg-yellow-300 transition cursor-pointer">กลับไปหน้าแรก</Motion.button>
                        </Motion.div>
                    )}

                    {/* Navigation Buttons */}
                    {!submitted && (
                        <div className="flex gap-4 mt-8">
                            <Motion.button
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
                            </Motion.button>

                            {step < totalSteps ? (
                                <Motion.button onClick={next} whileHover={buttonHover} whileTap={buttonTap} className="cursor-pointer flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#101330] font-semibold rounded-xl shadow">
                                    ถัดไป →
                                </Motion.button>
                            ) : (
                                <Motion.button
                                    onClick={handleSubmit}
                                    disabled={!registrationStatus.isOpen || registrationStatus.currentCount >= registrationStatus.maxCapacity}
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                    className="cursor-pointer flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow"
                                >
                                    ส่งแบบฟอร์ม
                                </Motion.button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* subtle background */}
            <div className="absolute inset-0 bg-linear-to-br from-yellow-400/5 via-transparent to-yellow-500/10 blur-3xl pointer-events-none"></div>
        </section>
    );
}

