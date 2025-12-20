// backend/routes/register.js
import express from "express";
import User from "../models/users.js";
import Settings from "../models/settings.js";
import { strictOriginCheck } from "../middleware/originCheck.js";

const router = express.Router();

router.post("/", strictOriginCheck, async (req, res) => {
  try {
    // Check if registration is open
    const settings = await Settings.getSettings();

    if (!settings.isRegistrationOpen) {
      return res.status(403).json({ error: "ขณะนี้ปิดรับสมัครแล้ว" });
    }

    // Check capacity
    const currentCount = await User.countDocuments();
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

    // เช็คอีเมลซ้ำ
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ error: "อีเมลนี้ถูกใช้สมัครแล้ว" });

    // บันทึก
    const newUser = await User.create({
      ...data,
      status: "pending",
      birthDate: data.birthDate,
    });

    res.status(201).json({ success: true, message: "สมัครสำเร็จ!", user: newUser });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(409).json({ error: "ข้อมูลซ้ำ" });
    res.status(500).json({ error: "บันทึกไม่สำเร็จ" });
  }
});

export default router;