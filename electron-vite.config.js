import { defineConfig } from "electron-vite";

export default defineConfig({
  main: { entry: "src/main/main.ts" },
  preload: { entries: ["src/preload/preload.ts"] },
  renderer: {},
});
