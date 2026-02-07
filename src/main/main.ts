import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

function createWindow() {
  /* ───────── Command-line hardening ───────── */
  app.commandLine.appendSwitch('--disable-extensions')
  app.commandLine.appendSwitch('--disable-features', 'OutOfBlinkCors')

  /* ───────── Splash ───────── */
  splashWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: true,
    backgroundColor: '#00000000',
    webPreferences: {
      devTools: false,
      sandbox: true
    }
  })

  const splashPath = app.isPackaged
    ? path.join(__dirname, 'splash.html')
    : path.join(__dirname, '../renderer/splash.html')

  splashWindow.loadFile(splashPath).catch(console.error)

  /* ───────── Main Window ───────── */
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    backgroundColor: '#0b0b0b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').catch(console.error)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../renderer/index.html')
    ).catch(console.error)
  }

  mainWindow.once('ready-to-show', () => {
    splashWindow?.destroy()
    splashWindow = null
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    splashWindow?.destroy()
    splashWindow = null
  })

  /* ───────── Intercept New Windows ───────── */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Optional: allow certain URLs in your app
    if (url.startsWith('http')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 1200,     // Set custom width
          height: 600,    // Set custom height
          resizable: true,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            devTools: false,
          }
        }
      }
    }
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
