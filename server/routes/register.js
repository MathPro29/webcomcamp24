// backend/routes/register.js
import express from "express";
import User from "../models/users.js";
import Settings from "../models/settings.js";
import { strictOriginCheck } from "../middleware/originCheck.js";
import { logRegistration } from "../utils/logger.js";

const router = express.Router();

router.post("/", strictOriginCheck, async (req, res) => {
  try {
    // Check if registration is open
    const settings = await Settings.getSettings();

    if (!settings.isRegistrationOpen) {
      return res.status(403).json({ error: "ขณะนี้ปิดรับสมัครแล้ว" });
    }

    // Check capacity (exclude users who forfeited their rights)
    const currentCount = await User.countDocuments({ status: { $ne: 'declined' } });
    if (currentCount >= settings.maxCapacity) {
      return res.status(403).json({ error: "จำนวนผู้สมัครเต็มแล้ว" });
    }

    const data = req.body;

    // เช็คฟิลด์ที่จำเป็น (ใช้ชื่อตรงกับ formData ของคุณ)
    const required = [
      "prefix", "firstName", "lastName", "nickname", "birthDate", "gender",
      "school", "grade", "province", "phone", "email",
      "emergencyContact", "emergencyPhone", "shirtSize", "laptop"
    ];

    for (const field of required) {
      if (!data[field] || data[field].toString().trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ error: "รูปแบบอีเมลไม่ถูกต้อง" });
    }

    // Validate phone numbers (must be 10 digits)
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = (data.phone || '').replace(/-/g, '');
    const cleanEmergencyPhone = (data.emergencyPhone || '').replace(/-/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" });
    }
    
    if (!phoneRegex.test(cleanEmergencyPhone)) {
      return res.status(400).json({ error: "เบอร์โทรศัพท์ฉุกเฉินต้องเป็นตัวเลข 10 หลัก" });
    }

    // เช็คอีเมลซ้ำ
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ error: "อีเมลนี้ถูกใช้สมัครแล้ว" });

    // Whitelist allowed fields to prevent status injection
    const allowedFields = [
      'prefix', 'firstName', 'lastName', 'nickname', 'birthDate', 'age',
      'gender', 'school', 'grade', 'province', 'phone', 'parentPhone',
      'email', 'lineId', 'shirtSize', 'allergies', 'medicalConditions',
      'emergencyContact', 'emergencyPhone', 'laptop'
    ];

    const userData = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        userData[field] = data[field];
      }
    });

    // บันทึก
    const newUser = await User.create({
      ...userData,
      status: "pending",
    });

    logRegistration(req, data, true);
    res.status(201).json({ success: true, message: "สมัครสำเร็จ!", user: newUser });
  } catch (err) {
    console.error(err);
    logRegistration(req, req.body, false, err.message);
    if (err.code === 11000) return res.status(409).json({ error: "ข้อมูลซ้ำ" });
    res.status(500).json({ error: "บันทึกไม่สำเร็จ" });
  }
});

export default router;