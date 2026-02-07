import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow = null;
let splashWindow = null;
function createWindow() {
  app.commandLine.appendSwitch("--disable-extensions");
  app.commandLine.appendSwitch("--disable-features", "OutOfBlinkCors");
  splashWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: true,
    backgroundColor: "#00000000",
    webPreferences: {
      devTools: false,
      sandbox: true
    }
  });
  const splashPath = app.isPackaged ? path.join(__dirname$1, "splash.html") : path.join(__dirname$1, "../renderer/splash.html");
  splashWindow.loadFile(splashPath).catch(console.error);
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    backgroundColor: "#0b0b0b",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: false
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173").catch(console.error);
  } else {
    mainWindow.loadFile(
      path.join(__dirname$1, "../renderer/index.html")
    ).catch(console.error);
  }
  mainWindow.once("ready-to-show", () => {
    splashWindow?.destroy();
    splashWindow = null;
    mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
    splashWindow?.destroy();
    splashWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 1200,
          // Set custom width
          height: 600,
          // Set custom height
          resizable: true,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            devTools: false
          }
        }
      };
    }
    return { action: "deny" };
  });
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
