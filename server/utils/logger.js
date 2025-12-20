/**
 * Logger Utility - บันทึก logs สำหรับ activities ต่างๆ
 */

import fs from 'fs';
import path from 'path';

// สร้าง logs directory ถ้าไม่มี
const LOGS_DIR = process.env.LOGS_DIR || './logs';
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Format timestamp สำหรับ log
 */
function getTimestamp() {
  const now = new Date();
  
  // Format: 2025-12-20 12:30:45
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get client IP from request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.headers['x-real-ip'] 
    || req.connection?.remoteAddress 
    || req.socket?.remoteAddress 
    || 'unknown';
}

/**
 * Write log to file
 */
function writeLog(filename, message) {
  const logPath = path.join(LOGS_DIR, filename);
  const timestamp = getTimestamp();
  const logLine = `[${timestamp}] ${message}\n`;
  
  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
  
  // Also log to console with colors
  const logType = filename.replace('.log', '').toUpperCase().padEnd(12);
  const colors = {
    'ADMIN': '\x1b[35m',      // Magenta
    'REGISTRATION': '\x1b[36m', // Cyan
    'PAYMENT': '\x1b[33m',     // Yellow
    'SECURITY': '\x1b[31m',    // Red
    'API': '\x1b[32m'          // Green
  };
  const color = colors[logType.trim()] || '\x1b[37m';
  const reset = '\x1b[0m';
  
  console.log(`${color}[${timestamp}] [${logType}]${reset} ${message}`);
}

/**
 * Log admin login
 */
export function logAdminLogin(req, username, success) {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || 'unknown';
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  
  writeLog('admin.log', `LOGIN ${status} │ User: ${username} │ IP: ${ip} │ UserAgent: ${userAgent.substring(0, 50)}`);
}

/**
 * Log admin logout
 */
export function logAdminLogout(req, username) {
  const ip = getClientIP(req);
  
  writeLog('admin.log', `LOGOUT │ User: ${username || 'unknown'} │ IP: ${ip}`);
}

/**
 * Log admin action
 */
export function logAdminAction(req, action, details) {
  const ip = getClientIP(req);
  const username = req.user?.username || 'unknown';
  
  writeLog('admin.log', `${action} │ Admin: ${username} │ IP: ${ip} │ Details: ${details}`);
}

/**
 * Log user registration
 */
export function logRegistration(req, userData, success, error = null) {
  const ip = getClientIP(req);
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  const name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'unknown';
  const email = userData.email || 'unknown';
  const school = userData.school || 'unknown';
  const errorMsg = error ? ` │ Error: ${error}` : '';
  
  writeLog('registration.log', `${status} │ Name: ${name} │ Email: ${email} │ School: ${school} │ IP: ${ip}${errorMsg}`);
}

/**
 * Log payment slip upload
 */
export function logPayment(req, paymentData, success, error = null) {
  const ip = getClientIP(req);
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  const name = paymentData.name || 'unknown';
  const phone = paymentData.phone || 'unknown';
  const errorMsg = error ? ` │ Error: ${error}` : '';
  
  writeLog('payment.log', `UPLOAD ${status} │ Name: ${name} │ Phone: ${phone} │ IP: ${ip}${errorMsg}`);
}

/**
 * Log payment status change
 */
export function logPaymentStatusChange(req, paymentId, oldStatus, newStatus, userName) {
  const ip = getClientIP(req);
  const admin = req.user?.username || 'unknown';
  
  writeLog('payment.log', `STATUS CHANGE │ User: ${userName} │ ${oldStatus} → ${newStatus} │ By: ${admin} │ IP: ${ip}`);
}

/**
 * Log security event (blocked requests)
 */
export function logSecurityEvent(req, reason) {
  const ip = getClientIP(req);
  const method = req.method;
  const path = req.path;
  const origin = req.get('origin') || 'no-origin';
  
  writeLog('security.log', `⛔ BLOCKED │ ${method} ${path} │ Reason: ${reason} │ Origin: ${origin} │ IP: ${ip}`);
}

/**
 * Log general API access
 */
export function logAPIAccess(req, endpoint, success, details = '') {
  const ip = getClientIP(req);
  const method = req.method;
  const status = success ? '✅' : '❌';
  
  writeLog('api.log', `${status} ${method} ${endpoint} │ IP: ${ip}${details ? ' │ ' + details : ''}`);
}
