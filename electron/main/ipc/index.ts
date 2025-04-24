import { app, BrowserWindow, ipcMain } from 'electron'
import { getMainWindow } from '../window'
import { checkForUpdates, downloadUpdate, quitAndInstall } from '../updater'
import { fetchUpdaterStatus } from '../kernel/updater'
import { handleDirectoryOpen, handleFileOpen, handleReadDirectory, statFileLlm } from '../files'
import { indexHtml, preload, VITE_DEV_SERVER_URL } from '../appPath'
import { pauseDownload, resumeDownload, startDownload, deleteFileLlm } from '../electron-downloader'
import { handleOllamaUpdater, isUpdateAvailable } from '../ollama/updater'
import { pullModel, pauseModel, deleteModel } from '../ollama/actions'

import Logger from 'electron-log/main'
import { handleEmbedModelUpdater } from '../embedModel'
const logger = Logger.scope('[main] ipc')

export const registerIpcMain = () => {
  logger.info('======== registerIpcMain START ========')
  ipcMain.handle('check-for-updates', async () => {
    const mainWindow = getMainWindow()
    mainWindow?.show()
    return checkForUpdates()
  })

  ipcMain.handle('download-update', async () => {
    return downloadUpdate()
  })

  ipcMain.handle('quit-and-install', async () => {
    return quitAndInstall()
  })

  ipcMain.handle('get-app-version', () => app.getVersion())

  ipcMain.handle('fetch-kernel-updater-status', async () => {
    return fetchUpdaterStatus()
  })

  ipcMain.handle('fetch-embed-model-updater-status', async () => {
    return handleEmbedModelUpdater()
  })

  ipcMain.handle('fetch-ollama-update-status', async () => {
    return handleOllamaUpdater()
  })

  ipcMain.handle('ollama:pull', async (_, modelName: string) => {
    return pullModel(modelName)
  })

  ipcMain.handle('ollama:pause', async (_, modelName: string) => {
    return pauseModel(modelName)
  })

  ipcMain.handle('ollama:delete', async (_, modelName: string) => {
    return deleteModel(modelName)
  })

  // status
  ipcMain.handle('ollama:get-status', async () => {
    return isUpdateAvailable()
  })

  // ipcMain.handle('is-backend-update-available', async () => {
  //   return isBackendUpdateAvailable()
  // })

  // ipcMain.handle('download-backend-update', async () => {
  //   return downloadBackendUpdate()
  // })

  // ipcMain.handle('extract-service', async (_, zipPath: string) => {
  //   return extractService(zipPath)
  // })

  // ipcMain.handle('extract-and-run-program', async () => {
  //   return extractAndRunProgram()
  // })

  ipcMain.handle('fs:readDirectory', handleReadDirectory)
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('dialog:openDirectory', handleDirectoryOpen)
  ipcMain.handle('stat:file:llm', (_, filename: string) => statFileLlm(filename))
  ipcMain.handle('delete:file:llm', (_, filename: string) => deleteFileLlm(filename))
  ipcMain.handle('get-platform', () => process.platform)
  // ipcMain.handle('toggle-dark-mode', (_, theme: string) => {
  //   const themeMap = {
  //     dark: {
  //       color: '#00000000',
  //       symbolColor: '#737373',
  //     },
  //     light: {
  //       color: '#ffffff00',
  //       symbolColor: '#737373',
  //     },
  //   }
  //   mainWindow?.setTitleBarOverlay?.(themeMap[theme as 'dark' | 'light'])
  // })

  // New window example arg: new windows url
  ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      webPreferences: {
        preload,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      childWindow.loadURL(`${VITE_DEV_SERVER_URL}/#${arg}`)
    } else {
      childWindow.loadFile(indexHtml, { hash: arg })
    }
  })

  ipcMain.handle('downloader:start', startDownload)
  ipcMain.handle('downloader:pause', pauseDownload)
  ipcMain.handle('downloader:resume', resumeDownload)

  // Download embedding model
  // ipcMain.handle('embed-model:download', )

  logger.info('======== registerIpcMain END ========')
}
