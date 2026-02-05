import { app, BrowserWindow } from "electron";
import path from "path";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
let mainWindow = null;
let splashWindow = null;
function createWindow() {
  splashWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    show: true,
    skipTaskbar: false
    // ensures visible in Alt+Tab
  });
  const splashPath = app.isPackaged ? path.join(__dirname, "splash.html") : path.join(__dirname, "../renderer/splash.html");
  console.log("Splash path being loaded:", splashPath);
  splashWindow.loadFile(splashPath).catch(
    (err) => console.error("Failed to load splash:", err)
  );
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    show: false,
    // hide until ready
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173").catch((err) => console.error("Failed to load dev server:", err));
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html")).catch((err) => console.error("Failed to load index.html:", err));
  }
  mainWindow.once("ready-to-show", () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow?.show();
  });
  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 5e3);
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
  });
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (!mainWindow) createWindow();
});
