import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      "/api": {
        target:
          process.env.VITE_API_PROXY_TARGET ||
          "https://dgpms-backend-h54g.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
