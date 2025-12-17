import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        dead_code: true,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
  },
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'webcomcamp24.com',
      'webcomcamp24.com:5173',
      'comcamp.csmju.com',
      'comcamp.csmju.com:5173'
    ],
    proxy: {
      '/api': {
        target: 'https://comcamp.csmju.com:5000', // backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
