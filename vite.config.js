import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    port: 5000,
    proxy: {
      "/api": {
        target: "https://www.apdevers-mp.onrender.com",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
