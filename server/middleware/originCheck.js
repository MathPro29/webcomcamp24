/**
 * Origin Validation Middleware
 * ป้องกัน API จาก Postman และ requests ที่ไม่ได้มาจาก frontend
 */

import { logSecurityEvent } from '../utils/logger.js';

const ALLOWED_ORIGINS = [
  'https://comcamp.csmju.com',
  'http://comcamp.csmju.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * ตรวจสอบ Origin ของ request
 * - Block ถ้าไม่มี origin หรือ referer (Postman, curl)
 * - Block ถ้า origin ไม่อยู่ใน whitelist
 * - Allow ถ้ามี admin token (admin dashboard)
 */
export const validateOrigin = (req, res, next) => {
  // Allow if admin is authenticated (has valid token)
  if (req.cookies?.token) {
    return next();
  }

  const origin = req.get('origin');
  const referer = req.get('referer');

  // Block requests without origin or referer (Postman, curl, etc.)
  if (!origin && !referer) {
    logSecurityEvent(req, 'No origin or referer header');
    console.warn(`⛔ Blocked request without origin: ${req.method} ${req.path}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Direct API access is not allowed'
    });
  }

  // Check if origin is in whitelist
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    logSecurityEvent(req, `Unauthorized origin: ${origin}`);
    console.warn(`⛔ Blocked request from unauthorized origin: ${origin}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Unauthorized origin'
    });
  }

  // Check if referer is from allowed origin
  if (referer) {
    const isAllowedReferer = ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed));
    if (!isAllowedReferer) {
      logSecurityEvent(req, `Unauthorized referer: ${referer}`);
      console.warn(`⛔ Blocked request from unauthorized referer: ${referer}`);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Unauthorized origin'
      });
    }
  }

  next();
};

/**
 * Strict origin check - ใช้กับ routes ที่ต้องการความปลอดภัยสูง
 * ต้องมี origin header เท่านั้น (ไม่รับแค่ referer)
 */
export const strictOriginCheck = (req, res, next) => {
  // Allow if admin is authenticated
  if (req.cookies?.token) {
    return next();
  }

  const origin = req.get('origin');

  if (!origin) {
    logSecurityEvent(req, 'Strict: No origin header');
    console.warn(`⛔ Strict: Blocked request without origin header: ${req.method} ${req.path}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Origin header required'
    });
  }

  if (!ALLOWED_ORIGINS.includes(origin)) {
    logSecurityEvent(req, `Strict: Unauthorized origin: ${origin}`);
    console.warn(`⛔ Strict: Blocked unauthorized origin: ${origin}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Unauthorized origin'
    });
  }

  next();
};
