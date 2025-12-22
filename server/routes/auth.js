import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import { verifyAdmin } from '../middleware/auth.js';
import { logAdminLogin, logAdminLogout, logAdminAction } from '../utils/logger.js';
import { validateCredentials, isValidString } from '../middleware/security.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Seed endpoint - สร้าง/อัปเดต admin ใน MongoDB (Protected - requires existing admin)
router.post('/seed-admin', verifyAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input types and format
    const validation = validateCredentials(username, password);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid input format',
        details: validation.errors 
      });
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();

    // Prevent NoSQL injection
    if (sanitizedUsername.includes('$') || sanitizedUsername.includes('.')) {
      return res.status(400).json({ error: 'Invalid username format' });
    }

    // ตรวจสอบ admin มีอยู่แล้วหรือไม่
    let admin = await Admin.findOne({ username: sanitizedUsername });

    if (admin) {
      // อัปเดต password
      admin.password = sanitizedPassword;
      await admin.save();
      logAdminAction(req, 'SEED-ADMIN', `Updated admin: ${sanitizedUsername}`);
      return res.json({ success: true, message: `อัปเดต admin '${sanitizedUsername}' สำเร็จ`, action: 'updated' });
    } else {
      // สร้าง admin ใหม่
      admin = new Admin({ username: sanitizedUsername, password: sanitizedPassword });
      await admin.save();
      logAdminAction(req, 'SEED-ADMIN', `Created admin: ${sanitizedUsername}`);
      return res.json({ success: true, message: `สร้าง admin '${sanitizedUsername}' สำเร็จ`, action: 'created' });
    }
  } catch (err) {
    console.error('❌ Seed admin error:', err);
    return res.status(500).json({ error: 'Seed admin ล้มเหลว', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    
    // Step 1: Validate credentials format and type
    const validation = validateCredentials(username, password);
    if (!validation.isValid) {
      console.warn('⚠️ Invalid login attempt:', {
        ip: req.ip,
        errors: validation.errors,
        username: typeof username,
        password: typeof password
      });
      return res.status(400).json({ 
        error: 'Invalid credentials format',
        details: validation.errors 
      });
    }

    // Step 2: Trim and sanitize inputs (already sanitized by middleware, but extra safety)
    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();

    // Step 3: Additional security checks
    // Prevent MongoDB operator injection in username
    if (sanitizedUsername.includes('$') || sanitizedUsername.includes('.')) {
      console.warn('⚠️ Potential NoSQL injection attempt:', {
        ip: req.ip,
        username: sanitizedUsername
      });
      return res.status(400).json({ error: 'Invalid username format' });
    }

    // Step 4: Find admin in MongoDB with explicit string query
    const admin = await Admin.findOne({ username: sanitizedUsername });
    if (!admin) {
      logAdminLogin(req, sanitizedUsername, false);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Step 5: Verify password with bcrypt (now protected against type errors)
    const isPasswordValid = await admin.comparePassword(sanitizedPassword);
    if (!isPasswordValid) {
      logAdminLogin(req, sanitizedUsername, false);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Step 6: Generate JWT token
    const payload = { username: sanitizedUsername };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    // Step 7: Set secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    };

    res.cookie('token', token, cookieOptions);
    logAdminLogin(req, sanitizedUsername, true);
    return res.json({ success: true, user: { username: sanitizedUsername } });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  try {
    const token = req.cookies?.token;
    let username = 'unknown';
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        username = payload.username;
      } catch (e) {
        // Token invalid, ignore
      }
    }
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    logAdminLogout(req, username);
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
