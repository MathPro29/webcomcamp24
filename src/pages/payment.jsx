import { useState } from "react";
import { Copy, Check, Upload, X } from "lucide-react";
import { notify } from "../utils/toast";

export default function PaymentSection() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slip, setSlip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // verification flow
  const [errors, setErrors] = useState([]);
  const [isVerified, setIsVerified] = useState(false); // ผ่านการตรวจสอบหรือไม่
  const [confirmedByUser, setConfirmedByUser] = useState(false);
  const [checking, setChecking] = useState(false);

  const bankAccount = "678-0-07822-3";
  const bankName = "ธนาคารกรุงเทพ";
  const accountName = "นายภานุวัฒน์ เมฆะ นายอรรถวิท ชังคมานนท์ และ นางปราณี กันธิมา";
  const amountText = "899 บาท";




  const handleCopy = async () => {
    const cleanedAccount = bankAccount.replace(/-/g, "");

    try {
      await navigator.clipboard.writeText(cleanedAccount);
      notify.success("คัดลอกเลขที่บัญชีเรียบร้อย");
    } catch (err) {
      // fallback สำหรับ HTTP หรือ clipboard ใช้ไม่ได้
      try {
        const textarea = document.createElement("textarea");
        textarea.value = cleanedAccount;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);

        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        notify.success("คัดลอกเลขที่บัญชีเรียบร้อย");
      } catch (err2) {
        notify.error("คัดลอกเลขที่บัญชีไม่สำเร็จ");
      }
    }
  };


  const clean_phone = (phone) => phone.replace(/\D/g, "");

  const validatePhoneFormat = (phoneDigits) => /^0\d{9}$/.test(phoneDigits);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMB = 5;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(["ไฟล์ต้องเป็น JPG หรือ PNG เท่านั้น"]);
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setErrors([`ไฟล์ต้องไม่เกิน ${maxMB}MB`]);
      return;
    }

    setSlip(file);
    setErrors([]);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveSlip = () => {
    setSlip(null);
    setPreviewUrl(null);
  };

  const runValidation = () => {
    const newErrors = [];
    if (!name.trim()) newErrors.push("กรุณากรอกชื่อ-นามสกุล");
    const phoneDigits = clean_phone(phone);
    if (!phoneDigits) newErrors.push("กรุณากรอกเบอร์โทรศัพท์");
    else if (!validatePhoneFormat(phoneDigits))
      newErrors.push("รูปแบบเบอร์ไม่ถูกต้อง (ต้องเริ่มด้วย 0 และยาว 10 หลัก)");
    return { ok: newErrors.length === 0, newErrors };
  };

  // ปุ่มตรวจสอบ (อยู่ถัดจากช่องเบอร์)
  const handleCheck = async (e) => {
    e?.preventDefault();
    setChecking(true);
    setErrors([]);
    setIsVerified(false);
    setConfirmedByUser(false);

    const { ok, newErrors } = runValidation();
    if (!ok) {
      setErrors(newErrors);
      setChecking(false);
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams({ name: name.trim(), phone: clean_phone(phone) });
      const res = await fetch(`${API_BASE}/api/payments/check?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }
      const data = await res.json();

      // ตรวจสอบว่ามีผู้สมัครในฐานข้อมูลหรือไม่
      if (!data.userExists) {
        setErrors(["❌ ไม่พบชื่อและเบอร์โทรนี้ในรายชื่อผู้สมัคร กรุณาตรวจสอบข้อมูลอีกครั้ง"]);
        setIsVerified(false);
        return;
      }

      // ตรวจสอบว่าจ่ายเงินแล้วหรือไม่
      if (data.exists) {
        setErrors(["❌ ผู้สมัครรายนี้ได้ชำระเงินแล้ว ไม่สามารถชำระซ้ำได้"]);
        setIsVerified(false);
        return;
      }

      // ผ่านการตรวจสอบ - มีผู้สมัครและยังไม่ชำระเงิน
      setIsVerified(true);
      setErrors([]);
    } catch (err) {
      console.error("Check error:", err);
      setErrors(["⚠️ เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่ภายหลัง"]);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      notify.error("กรุณากด 'ตรวจสอบข้อมูล' ก่อนยืนยันการชำระเงิน");
      return;
    }
    if (!confirmedByUser) {
      notify.error("กรุณาติ๊ก 'ฉันยืนยันว่าตรวจสอบเรียบร้อย' ก่อนยืนยันการชำระเงิน");
      return;
    }
    if (!slip) {
      notify.error("กรุณาอัปโหลดสลิปการโอนเงิน");
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("phone", clean_phone(phone));
    formData.append("slip", slip);

    try {
      const res = await fetch(`${API_BASE}/api/payments`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (res.status === 409) {
        // ซ้ำ — backend ป้องกันไว้
        const body = await res.json();
        notify.error(body.message || "รายการนี้มีการชำระแล้ว ไม่สามารถยืนยันซ้ำได้");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }

      notify.success("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว!");
      // รีเซ็ตฟอร์ม
      setName("");
      setPhone("");
      handleRemoveSlip();
      setIsVerified(false);
      setConfirmedByUser(false);
      setErrors([]);
    } catch (err) {
      console.error(err);
      notify.error("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่ภายหลัง");
    }
  };


  return (
    <div className="py-8 sm:py-16 lg:py-20 text-white relative overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-4 sm:mt-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-14 font-bold bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            ชำระเงิน
          </h2>
          <p className="text-white/70 mt-3 sm:mt-4 text-sm sm:text-base">
            กรุณาโอนเงินและอัปโหลดสลิปเพื่อยืนยันการชำระเงิน
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">

            <div className="bg-white/10 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-300">
                ข้อมูลการชำระเงิน
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {/* ชื่อ-นามสกุล */}
                <div>
                  <label htmlFor="name" className="block text-left mb-2 font-medium text-sm sm:text-base">
                    ชื่อ-นามสกุล <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setIsVerified(false); // แก้ข้อมูลต้องตรวจสอบใหม่
                      setConfirmedByUser(false);
                    }}
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* เบอร์โทรศัพท์ + ปุ่มตรวจสอบข้างๆ */}
                <div>
                  <label htmlFor="phone" className="block text-left mb-2 font-medium text-sm sm:text-base">
                    เบอร์โทรศัพท์ <span className="text-red-400">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(clean_phone(e.target.value));
                        setIsVerified(false); // แก้ข้อมูลต้องตรวจสอบใหม่
                        setConfirmedByUser(false);
                      }}
                      placeholder="กรอกเบอร์โทรศัพท์มือถือ"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                    />

                    <button
                      type="button"
                      onClick={handleCheck}
                      disabled={checking}
                      className="cursor-pointer whitespace-nowrap bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto"
                    >
                      {checking ? "กำลังตรวจสอบ..." : "ตรวจสอบข้อมูล"}
                    </button>
                  </div>
                </div>

                {/* ข้อความแสดงข้อผิดพลาด */}
                {errors.length > 0 && (
                  <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
                    {errors.map((err, idx) => (
                      <p key={idx} className="text-red-300 text-sm">{err}</p>
                    ))}
                  </div>
                )}

                {/* ช่องอัปโหลดสลิป — ปิดจนกว่าจะ isVerified === true */}
                <div>
                  <label className="block text-left mb-2 font-medium text-sm sm:text-base">
                    อัปโหลดสลิปการโอนเงิน <span className="text-red-400">*</span>
                  </label>

                  {/* ถ้ายังไม่ตรวจสอบ จะแสดงกล่อง disabled */}
                  {!isVerified ? (
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-6 sm:p-8 text-center opacity-60 pointer-events-none">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-white/60" />
                      <p className="text-white/60 mb-1 text-sm sm:text-base">กรุณากดปุ่ม "ตรวจสอบข้อมูล" ก่อนอัปโหลดสลิป</p>
                    </div>
                  ) : (
                    !previewUrl ? (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-white/30 rounded-lg p-6 sm:p-8 text-center hover:border-yellow-400 hover:bg-white/5 transition-all">
                          <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-white/60" />
                          <p className="text-white/80 mb-1 text-sm sm:text-base">คลิกเพื่อเลือกไฟล์</p>
                          <p className="text-white/50 text-xs sm:text-sm">รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Payment slip preview"
                          className="w-full h-64 object-cover rounded-lg border-2 border-yellow-400"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveSlip}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <p className="text-white/70 text-sm mt-2">{slip?.name}</p>
                      </div>
                    )
                  )}
                </div>

                {/* ถ้าตรวจสอบผ่าน ให้โชว์สรุปและ checkbox ยืนยันโดยผู้ใช้ */}
                {isVerified && (
                  <div className="mt-4 bg-white/5 border border-yellow-400/30 rounded-lg p-3 sm:p-4">
                    <p className="text-yellow-300 font-semibold mb-2 text-sm sm:text-base">พบข้อมูล!</p>
                    <ul className="text-white/80 text-xs sm:text-sm space-y-1 mb-3">
                      <li>ชื่อ-นามสกุล: <strong className="text-white">{name}</strong></li>
                      <li>เบอร์โทรศัพท์: <strong className="text-white">{clean_phone(phone)}</strong></li>
                      <li>จำนวนเงินที่โอน: <strong className="text-white">{amountText}</strong></li>
                      <li>ชื่อบัญชี: <strong className="text-white">{accountName}</strong></li>
                      <li>เลขที่บัญชี: <strong className="text-white">{bankAccount}</strong></li>
                      <li>ไฟล์สลิป: <strong className="text-white">{slip?.name || "-"}</strong></li>
                    </ul>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={confirmedByUser}
                        onChange={(e) => setConfirmedByUser(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-white/80 text-sm">
                        ฉันยืนยันว่าตรวจสอบข้อมูลเรียบร้อยแล้ว
                      </span>
                    </label>
                  </div>
                )}


                {/* ปุ่มยืนยันการชำระเงิน อยู่ท้ายฝั่งบัญชี (แต่เป็น submit ของฟอร์ม) */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className={`w-full ${isVerified && confirmedByUser
                      ? "cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                      : "bg-gray-600/30 cursor-not-allowed"
                      } text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300`}
                    disabled={!isVerified || !confirmedByUser}
                  >
                    ยืนยันการชำระเงิน
                  </button>
                </div>

              </div>
            </div>

            {/* ===== ข้อมูลบัญชีธนาคาร ===== */}
            <div className="bg-white/10 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-300">ข้อมูลบัญชีธนาคาร</h3>

              <div className="mb-4 sm:mb-6 bg-white rounded-xl p-4 sm:p-6 flex items-center justify-center">
                <div className="text-center">
                  <img src="src/assets/bookbank.jpg" alt="bookbank" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 bg-white/5 p-4 sm:p-6 rounded-xl">
                <div>
                  <p className="text-white/60 text-xs sm:text-sm mb-1">ธนาคาร</p>
                  <p className="text-white font-semibold text-base sm:text-lg">{bankName}</p>
                </div>

                <div>
                  <p className="text-white/60 text-xs sm:text-sm mb-1">ชื่อบัญชี</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{accountName}</p>
                </div>

                <div>
                  <p className="text-white/60 text-xs sm:text-sm mb-1">เลขที่บัญชี</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2">
                    <span className="text-white font-mono text-lg sm:text-xl font-bold flex-1">{bankAccount}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white p-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-medium">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-medium">คัดลอก</span>
                        </>
                      )}
                    </button>

                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-white/20">
                    <p className="text-yellow-300 font-semibold text-base sm:text-lg">จำนวนเงิน: {amountText}</p>
                  </div>
                </div>

                {/* หมายเหตุ */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
                  <p className="text-yellow-300 text-xs sm:text-sm">
                    <strong>หมายเหตุ:</strong> หลังตรวจสอบแล้วจึงสามารถอัปโหลดสลิปและกดยืนยันการชำระเงินได้ — ทีมงานจะตรวจสอบสลิปและยืนยันสถานะภายหลัง
                  </p>
                </div>

              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
