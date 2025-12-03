import rateLimit from "express-rate-limit";

export const limitsignup = rateLimit({
  windowMs: 60 * 1000, // 1 นาที
  max: 2,              // 2 requests ต่อ IP ต่อ window
  standardHeaders: true, // ส่ง X-RateLimit-* headers
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many requests. Please try again later."
  }
});

// refreshing

export const limitrefreshing = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "รีเฟรชบ่อยเกินไป ลองใหม่อีกครั้งในภายหลัง"
});

// ถ้าต้องการ limiter อื่น ๆ ก็ export เพิ่มได้ เช่น loginLimiter
export const loginlimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try again later."
});
