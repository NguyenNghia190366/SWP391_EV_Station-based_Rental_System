// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { fileURLToPath, URL } from "node:url";

// // https://vite.dev/config/
// export default defineConfig({
//   base: "",
//   plugins: [react()],
//   define: {
//     global: "globalThis",
//   },
//   resolve: {
//     alias: {
//       "@": fileURLToPath(new URL("./src", import.meta.url)),
//     },
//   },
//   server: {
//     host: "0.0.0.0",
//     port: 5173,
//     proxy: {
//       "/api": {
//         target: "http://localhost:5189",
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path,
//       },
//     },
//   },
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "",

  plugins: [react()],

  define: {
    global: "globalThis",
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5173,

    // ❗ REMOVE proxy because Vercel doesn't run a local backend
    proxy: {},
  },

  build: {
    outDir: "dist",
  },
});
