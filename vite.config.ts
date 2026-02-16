// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isElectron = mode === "electron";

  return {
    root: path.resolve(__dirname, "src/renderer"),
    base: isElectron ? "./" : "/your-repo-name/",
    plugins: [react()],
  };
});

