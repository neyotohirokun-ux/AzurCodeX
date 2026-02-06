import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function createWindow() {
  /* ───────── Splash Window ───────── */
  splashWindow = new BrowserWindow({
    width: 480,
    height: 270,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: true,
    backgroundColor: '#00000000',
    webPreferences: {
      devTools: false
    }
  });

  const splashPath = app.isPackaged
    ? path.join(__dirname, 'splash.html')
    : path.join(__dirname, '../renderer/splash.html');

  splashWindow.loadFile(splashPath).catch(console.error);

  /* ───────── Main Window ───────── */
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    show: false,
    backgroundColor: '#0b0b0b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').catch(console.error);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../renderer/index.html')
    ).catch(console.error);
  }

  /* ───────── Reveal ONLY when ready ───────── */
  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.destroy();   // destroy > close
      splashWindow = null;
    }
    mainWindow?.show();
  });

  /* ───────── Cleanup ───────── */
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.destroy();
      splashWindow = null;
    }
  });
}

/* ───────── App lifecycle ───────── */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* ───────── End of main.ts ───────── */