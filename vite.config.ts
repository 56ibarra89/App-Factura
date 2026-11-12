import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

function vendorChunk(id: string): string | undefined {
  const moduleId = id.replaceAll("\\", "/");
  if (!moduleId.includes("/node_modules/")) return undefined;

  if (
    moduleId.includes("/react/") ||
    moduleId.includes("/react-dom/") ||
    moduleId.includes("/react-router/") ||
    moduleId.includes("/react-router-dom/") ||
    moduleId.includes("/scheduler/")
  ) {
    return "vendor-react";
  }
  if (
    moduleId.includes("/socket.io-client/") ||
    moduleId.includes("/engine.io-client/") ||
    moduleId.includes("/socket.io-parser/") ||
    moduleId.includes("/engine.io-parser/")
  ) {
    return "vendor-realtime";
  }
  return undefined;
}

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer:
        process.env.NODE_ENV === "test"
          ? undefined
          : {},
    }),
  ],
});
