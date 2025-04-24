import { BrowserWindow, shell } from 'electron'
import Logger from 'electron-log/main'
import { indexHtml, preload, VITE_DEV_SERVER_URL, iconPath } from './appPath'

const logger = Logger.scope('[main] window')

let mainWindow: BrowserWindow | null = null

export const getMainWindow = () => {
  return mainWindow
}

export const getMainWindowOrCreate = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow
  }
  return createWindow()
}

export const destroyMainWindow = () => {
  logger.info('try to destroy main window')
  if (mainWindow) {
    mainWindow.destroy()
    mainWindow = null
    logger.info('main window destroyed')
  }
}

export const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    titleBarStyle: 'hidden',
    // Windows titleBarOverlay configuration
    titleBarOverlay: {
      height: 44,
      color: '#00000000',
      symbolColor: '#737373',
    },
    frame: false,
    webPreferences: {
      preload,
      webSecurity: false,
    },

    trafficLightPosition: {
      x: 8,
      y: 14,
    },

    icon: iconPath,
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)

    // open devtools
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(indexHtml)
  }

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (details) => {
    if (VITE_DEV_SERVER_URL && details.url.startsWith(VITE_DEV_SERVER_URL)) return

    details.preventDefault()
    shell.openExternal(details.url)
  })

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    // console.error('Page loading failed:', errorCode, errorDescription)
    logger.info('load page failed:', errorCode, errorDescription)
  })

  return mainWindow
}
