// server/routes/register.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    // ตรวจสอบฟิลด์ที่จำเป็น
    const required = [
      'prefix', 'firstName', 'lastName', 'nickname', 'birthDate', 'gender',
      'school', 'grade', 'province', 'phone', 'email',
      'emergencyContact', 'emergencyPhone', 'shirtSize'
    ];

    for (const field of required) {
      if (!data[field]) {
        return res.status(400).json({ error: `กรุณากรอก${field === 'email' ? 'อีเมล' : 'ข้อมูล'}ให้ครบถ้วน` });
      }
    }

    // ตรวจสอบ email ซ้ำ
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้สมัครแล้ว' });
    }

    // สร้างผู้ใช้
    const user = await User.create({
      ...data,
      birthDate: new Date(data.birthDate)
    });

    res.status(201).json({ message: 'สมัครสำเร็จ!', user });

  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้แล้ว' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
});

export default router;