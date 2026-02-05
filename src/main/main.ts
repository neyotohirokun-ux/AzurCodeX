import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function createWindow() {
  // --- Splash window ---
  splashWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    show: true,
    skipTaskbar: false, // ensures visible in Alt+Tab
  });

  // --- Splash path ---
  const splashPath = app.isPackaged
    ? path.join(__dirname, 'splash.html')       // prod
    : path.join(__dirname, '../renderer/splash.html'); // dev

  console.log('Splash path being loaded:', splashPath);
  splashWindow.loadFile(splashPath).catch(err =>
    console.error('Failed to load splash:', err)
  );


  // --- Main window ---
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    show: false, // hide until ready
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // Load dev server or production index
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').catch(err => console.error('Failed to load dev server:', err));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
      .catch(err => console.error('Failed to load index.html:', err));
  }

  // --- Show main window when ready ---
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow?.show();
  });

  // --- Safety fallback in case ready-to-show never fires (slow first load) ---
  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 5000);

  // --- Cleanup on close ---
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
  });
}

// --- App event listeners ---
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
