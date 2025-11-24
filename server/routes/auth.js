import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Admin credentials come from env (for demo). In production use DB + hashed passwords.
const FALLBACK_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'adminbas',
  password: process.env.ADMIN_PASSWORD || 'admin69',
};

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    if (username !== FALLBACK_ADMIN.username || password !== FALLBACK_ADMIN.password) {
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
