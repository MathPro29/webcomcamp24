import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Seed endpoint - สร้าง/อัปเดต admin ใน MongoDB
router.post('/seed-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username และ password ต้องระบุ' });
    }

    // ตรวจสอบ admin มีอยู่แล้วหรือไม่
    let admin = await Admin.findOne({ username });

    if (admin) {
      // อัปเดต password
      admin.password = password;
      await admin.save();
      return res.json({ success: true, message: `อัปเดต admin '${username}' สำเร็จ`, action: 'updated' });
    } else {
      // สร้าง admin ใหม่
      admin = new Admin({ username, password });
      await admin.save();
      return res.json({ success: true, message: `สร้าง admin '${username}' สำเร็จ`, action: 'created' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Seed admin ล้มเหลว', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    // ค้นหา admin ใน MongoDB
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // เช็ค password ด้วย bcrypt
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    };

    res.cookie('token', token, cookieOptions);
    return res.json({ success: true, user: { username } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ authenticated: false });

    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, user: payload });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
});

export default router;
