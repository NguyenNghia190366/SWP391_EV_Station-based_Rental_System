import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    // ⚠️ DISABLE proxy when using ngrok URL
    // Uncomment proxy below ONLY when using LOCAL BE (localhost:5189)
    // Enable proxy when developing locally so requests to /api are forwarded to the .NET backend
    // ⚠️ If you use ngrok or a remote backend, disable this block and set the BASE_URL in src/api/api.js accordingly
    proxy: {
      '/api': {
        target: 'http://localhost:5189', // Local backend (see EVRental_BE/Properties/launchSettings.json)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})



