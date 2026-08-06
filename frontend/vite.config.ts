import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
  server: {
    host: "0.0.0.0",
    hmr: {
      port: 4784,
      clientPort: Number(process.env.RR_HMR_PORT ?? 4784),
    },
  },
}));
