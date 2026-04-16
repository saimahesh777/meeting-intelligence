import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config — proxies /api/* to the Express proxy server
// This keeps the Anthropic API key out of the browser bundle.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request from the frontend to /api/ai is forwarded to the proxy server
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
