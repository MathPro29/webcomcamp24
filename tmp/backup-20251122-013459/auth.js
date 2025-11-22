// server/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // path ตามที่สร้าง
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, message: 'Missing credentials' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ ok: false, message: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ ok: false, message: 'Invalid username or password' });

    // สร้าง JWT (เก็บข้อมูลพอจำเป็น เช่น userId, role). อย่าเก็บข้อมูลลับมาก
    const payload = { sub: user._id, role: user.role, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2h' });

    // ตัวอย่าง: คืน JSON ที่มี token (frontend จะเก็บ/ใช้)
    return res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;