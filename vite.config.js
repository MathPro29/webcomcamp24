import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // ปิด source maps เพื่อไม่ให้ดูซอร์สโค้ดได้
    sourcemap: false,
    // ใช้ terser สำหรับ minification ที่ดีกว่า
    minify: 'terser',
    terserOptions: {
      compress: {
        // ลบ console และ debugger ทั้งหมดตอน build
        // drop_console: true,
        // drop_debugger: true,
        // ลบโค้ดที่ไม่ได้ใช้
        dead_code: true,
      },
      mangle: {
        // เปลี่ยนชื่อตัวแปร/ฟังก์ชันให้อ่านยาก
        toplevel: true,
      },
      format: {
        // ลบ comments ทั้งหมด
        comments: false,
      },
      server: {
        allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'webcomcamp24.com', 'webcomcamp24.com:5173','comcamp.csmju.com'],
      },
    },
  },
})
