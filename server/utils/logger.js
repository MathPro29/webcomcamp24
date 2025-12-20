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
  // Use Thailand timezone (UTC+7)
  const options = { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return now.toLocaleString('th-TH', options);
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
  const logLine = `${getTimestamp()} | ${message}\n`;
  
  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
  
  // Also log to console
  console.log(`[${filename.replace('.log', '')}] ${message}`);
}

/**
 * Log admin login
 */
export function logAdminLogin(req, username, success) {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || 'unknown';
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  
  writeLog('admin.log', `LOGIN ${status} | User: ${username} | IP: ${ip} | UA: ${userAgent}`);
}

/**
 * Log admin logout
 */
export function logAdminLogout(req, username) {
  const ip = getClientIP(req);
  
  writeLog('admin.log', `LOGOUT | User: ${username || 'unknown'} | IP: ${ip}`);
}

/**
 * Log admin action
 */
export function logAdminAction(req, action, details) {
  const ip = getClientIP(req);
  const username = req.user?.username || 'unknown';
  
  writeLog('admin.log', `ACTION | User: ${username} | IP: ${ip} | ${action} | ${details}`);
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
  const errorMsg = error ? ` | Error: ${error}` : '';
  
  writeLog('registration.log', `${status} | Name: ${name} | Email: ${email} | School: ${school} | IP: ${ip}${errorMsg}`);
}

/**
 * Log payment slip upload
 */
export function logPayment(req, paymentData, success, error = null) {
  const ip = getClientIP(req);
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  const name = paymentData.name || 'unknown';
  const phone = paymentData.phone || 'unknown';
  const errorMsg = error ? ` | Error: ${error}` : '';
  
  writeLog('payment.log', `UPLOAD ${status} | Name: ${name} | Phone: ${phone} | IP: ${ip}${errorMsg}`);
}

/**
 * Log payment status change
 */
export function logPaymentStatusChange(req, paymentId, oldStatus, newStatus, userName) {
  const ip = getClientIP(req);
  const admin = req.user?.username || 'unknown';
  
  writeLog('payment.log', `STATUS CHANGE | PaymentID: ${paymentId} | User: ${userName} | ${oldStatus} → ${newStatus} | By: ${admin} | IP: ${ip}`);
}

/**
 * Log security event (blocked requests)
 */
export function logSecurityEvent(req, reason) {
  const ip = getClientIP(req);
  const method = req.method;
  const path = req.path;
  const origin = req.get('origin') || 'no-origin';
  
  writeLog('security.log', `⛔ BLOCKED | ${method} ${path} | Reason: ${reason} | Origin: ${origin} | IP: ${ip}`);
}

/**
 * Log general API access
 */
export function logAPIAccess(req, endpoint, success, details = '') {
  const ip = getClientIP(req);
  const method = req.method;
  const status = success ? '✅' : '❌';
  
  writeLog('api.log', `${status} ${method} ${endpoint} | IP: ${ip}${details ? ' | ' + details : ''}`);
}
