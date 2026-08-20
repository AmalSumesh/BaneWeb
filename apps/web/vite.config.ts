import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@biotech-arbitrage/types": path.resolve(
        __dirname,
        "../../packages/types/src/index.ts",
      ),
      "@biotech-arbitrage/config": path.resolve(
        __dirname,
        "../../packages/config/src/index.ts",
      ),
      "@biotech-arbitrage/api-client": path.resolve(
        __dirname,
        "../../packages/api-client/src/index.ts",
      ),
      "@biotech-arbitrage/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
