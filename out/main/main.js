import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const iconPath = path.join(__dirname$1, "../renderer/img/iconlogo/mk1-526x2.ico");
let mainWindow = null;
let splashWindow = null;
function createWindow() {
  app.commandLine.appendSwitch("--disable-extensions");
  app.commandLine.appendSwitch("--disable-features", "OutOfBlinkCors");
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    backgroundMaterial: "mica",
    resizable: false,
    alwaysOnTop: true,
    show: true,
    icon: iconPath,
    backgroundColor: "#00000000",
    webPreferences: {
      devTools: false,
      sandbox: true
    }
  });
  const splashPath = app.isPackaged ? path.join(app.getAppPath(), "out/renderer/splash.html") : path.join(__dirname$1, "../renderer/splash.html");
  splashWindow.loadFile(splashPath).catch(console.error);
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    transparent: true,
    backgroundMaterial: "mica",
    backgroundColor: "#0b0b0b",
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
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
          width: 1e3,
          // Set custom width
          height: 600,
          // Set custom height
          resizable: true,
          autoHideMenuBar: true,
          icon: iconPath,
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
ipcMain.on("app-close", () => {
  app.quit();
});
