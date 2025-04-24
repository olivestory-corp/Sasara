import { cleanupChildProcess } from '../kernel/executor'
import { cleanupChildProcess as cleanupOllamaProcess } from '../ollama/exectutor'
import { app } from 'electron'
import path from 'path'
import os from 'os'
import { openUrl } from '../files'
import { getMainWindow, createWindow, getMainWindowOrCreate } from '../window'
import Logger from 'electron-log/main'
const logger = Logger.scope('[main] lifecycle')

const cleanupQueue: (() => Promise<void>)[] = []

export async function registerCleanup(cleanup: () => Promise<void>) {
  if (cleanupQueue.includes(cleanup)) {
    return
  }
  cleanupQueue.push(cleanup)
}

registerCleanup(cleanupChildProcess)
registerCleanup(cleanupOllamaProcess)

async function cleanupAll() {
  while (cleanupQueue.length > 0) {
    const cleanup = cleanupQueue.shift()
    if (cleanup) {
      await cleanup()
    }
  }
}

export const registerLifecycle = () => {
  logger.info('======== registerLifecycle START ========')

  app.on('will-quit', () => {
    logger.info('Application will quit')
    cleanupAll()
  })

  app.on('before-quit', () => {
    logger.info('Application before quit')
    cleanupAll()
  })

  // Handle Ctrl+C and similar signals
  process.on('SIGINT', () => {
    logger.info('Received SIGINT signal')
    cleanupAll()
    app.quit()
  })

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal')
    cleanupAll()
    app.quit()
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.info('uncaught exception:', err)
    cleanupAll()
    app.quit()
  })

  // Handle the protocol. In this case, we choose to show an Error Box.
  app.on('open-url', (event, url) => {
    openUrl(url)
  })

  app.on('second-instance', (event, commandLine) => {
    const mainWindow = getMainWindow()
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      // Focus on the main window if the user tried to open another
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
    const url = commandLine.pop()
    if (url) {
      openUrl(url)
    }
  })

  app.on('window-all-closed', () => {
    logger.info('window-all-closed')
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    logger.info('activate')
    const mainWindow = getMainWindowOrCreate()
    if (mainWindow) {
      logger.info('mainWindow focus')
      mainWindow.focus()
    } else {
      logger.info('createWindow')
      createWindow()
    }
  })

  app.whenReady().then(createWindow)

  // Disable GPU Acceleration
  app.disableHardwareAcceleration()

  // Disable GPU Acceleration for Windows 7
  if (os.release().startsWith('6.1')) {
    app.disableHardwareAcceleration()
  }

  // Register our app to handle all "electron-fiddle://" protocols
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('klee', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('klee')
  }

  if (process.env.NODE_ENV === 'development') {
    if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(app.getAppPath(), './build/icons/512x512.png'))
    }
  }

  // Set application name for Windows 10+ notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName())
  }

  if (process.platform === 'win32') {
    logger.info(`start to requestSingleInstanceLock`)

    if (!app.requestSingleInstanceLock()) {
      app.quit()
      process.exit(0)
    }
    logger.info(`requestSingleInstanceLock completed`)
  }

  if (process.platform === 'win32') {
    const gotTheLock = app.requestSingleInstanceLock()
    if (gotTheLock) {
      app.on('second-instance', (event, commandLine) => {
        for (const item of commandLine) {
          logger.info(`second-instance opening app -> :${item}`)
          // If the current line contains klee:// then open it
          if (item.includes('klee://')) {
            openUrl(item)
          }
        }

        const mainWindow = getMainWindow()
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      })
    }
  }
  logger.info('======== registerLifecycle END ========')
}
