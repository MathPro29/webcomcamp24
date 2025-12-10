import { notify } from './toast';

// Configuration
const MAX_REQUESTS = 10; // Maximum number of requests allowed
const TIME_WINDOW = 60000; // Time window in milliseconds (60 seconds)
const BLOCK_DURATION = 10000; // Block duration in milliseconds (10 seconds)

// Store request timestamps and block status
let requestTimestamps = [];
let blockedUntil = null;

/**
 * Check if the user has exceeded the rate limit
 * @returns {boolean} - Returns true if the request is allowed, false if blocked
 */
export const limitrefresh = () => {
  const now = Date.now();

  // Check if currently blocked
  if (blockedUntil && now < blockedUntil) {
    const remainingSeconds = Math.ceil((blockedUntil - now) / 1000);
    notify.warn(`กรุณารอ ${remainingSeconds} วินาที ก่อนค้นหาอีกครั้ง`, {
      position: 'top-right',
      autoClose: 3000,
    });
    return false;
  }

  // Clear block if time has passed
  if (blockedUntil && now >= blockedUntil) {
    blockedUntil = null;
    requestTimestamps = [];
  }

  // Remove timestamps outside the time window
  requestTimestamps = requestTimestamps.filter(
    timestamp => now - timestamp < TIME_WINDOW
  );

  // Check if limit exceeded
  if (requestTimestamps.length >= MAX_REQUESTS) {
    blockedUntil = now + BLOCK_DURATION;
    notify.error('คุณค้นหาบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง', {
      position: 'top-right',
      autoClose: 3000,
    });
    return false;
  }

  // Add current timestamp
  requestTimestamps.push(now);
  return true;
};

/**
 * Reset the rate limiter (useful for testing or manual reset)
 */
export const resetLimitRefresh = () => {
  requestTimestamps = [];
  blockedUntil = null;
};
