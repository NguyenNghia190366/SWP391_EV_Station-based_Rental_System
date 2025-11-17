/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import 'path' module của Node.js

export default defineConfig({
  plugins: [react()], // Báo Vitest dùng plugin React
  test: {
    // Bật các API global (expect, test, describe...)
    globals: true,
    // Dùng môi trường 'jsdom' (trình duyệt ảo)
    environment: 'jsdom',
    // Chỉ định file setup (chúng ta sẽ sửa file này ở bước sau)
    setupFiles: './vitest.setup.js',
    // Báo Vitest xử lý file CSS
    css: true,
  },
  // (QUAN TRỌNG) Cấu hình 'resolve.alias' để Vitest hiểu "@/"
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
,
});