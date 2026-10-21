import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Serve original WP media/fonts without copying gigabytes
      "/wp-content": {
        target: "http://127.0.0.1",
        changeOrigin: true,
        rewrite: (p) => "/melamu" + p,
      },
    },
  },
});
