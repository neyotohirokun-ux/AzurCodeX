import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const iconPath = path.join(__dirname, '../renderer/img/iconlogo/mk1-526x2.ico')

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

function createWindow() {
  /* ───────── Command-line hardening ───────── */
  app.commandLine.appendSwitch('--disable-extensions')
  app.commandLine.appendSwitch('--disable-features', 'OutOfBlinkCors')

  /* ───────── Splash ───────── */
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    backgroundMaterial: 'mica',
    resizable: false,
    alwaysOnTop: true,
    show: true,
    icon: iconPath,
    backgroundColor: '#00000000',
    webPreferences: {
      devTools: false,
      sandbox: true
    }
  })

  const splashPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar', 'out/renderer/splash.html')
    : path.join(__dirname, '../renderer/splash.html')

  splashWindow.loadFile(splashPath).catch(console.error)

  /* ───────── Main Window ───────── */
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    transparent: true,
    backgroundMaterial: 'mica',
    backgroundColor: '#0b0b0b',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
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
          width: 1000,     // Set custom width
          height: 600,    // Set custom height
          resizable: true,
          autoHideMenuBar: true,
          icon: iconPath,
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
