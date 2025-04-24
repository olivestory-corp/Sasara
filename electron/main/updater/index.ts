import { getAutoUpdater } from './auto-updater'
import { channel, isDev, isWindows } from '../env'
import { destroyMainWindow, getMainWindow } from '../window'
import { WindowsUpdater } from './windows-updater'
import { cleanupChildProcess } from '../kernel/executor'
import Logger from 'electron-log/main'
const logger = Logger.scope('[main] updater')

// skip auto update in dev mode
const disabled = false
// const disabled = isDev

const autoUpdater = isWindows ? new WindowsUpdater() : getAutoUpdater()

export const quitAndInstall = () => {
  const mainWindow = getMainWindow()

  destroyMainWindow()
  // TODO: Kill process after incremental update?
  cleanupChildProcess()
  logger.info('Quit and install update, close main window, ', mainWindow?.id)

  setTimeout(() => {
    logger.info('Window is closed, quit and install update')
    autoUpdater.quitAndInstall()
  }, 1000)
}

let downloading = false
let downloaded = false
let checkingUpdate = false

type UpdaterConfig = {
  autoCheckUpdate: boolean
  autoDownloadUpdate: boolean
  checkUpdateInterval: number
}

const config: UpdaterConfig = {
  autoCheckUpdate: false,
  autoDownloadUpdate: false,
  checkUpdateInterval: 15 * 60 * 1000,
}

export const checkForUpdates = async () => {
  if (disabled) {
    logger.info('updater disabled, maybe in dev mode, directly pass')
    return
  }
  if (checkingUpdate) {
    logger.info('already checking for updates')
    return
  }
  checkingUpdate = true
  try {
    const info = await autoUpdater.checkForUpdates()
    return info
  } finally {
    checkingUpdate = false
  }
}

export const downloadUpdate = async () => {
  if (downloaded) {
    downloading = false
    getMainWindow()?.webContents.send('update-downloaded')

    logger.info('update already downloaded, skip download')
    return
  }
  if (disabled || downloading) {
    logger.info('updater disabled or already downloading')
    return
  }
  downloading = true
  logger.info('Update available, downloading...')
  autoUpdater.downloadUpdate().catch((e) => {
    downloading = false
    logger.error('Failed to download update', e)
  })
  return
}

export const registerUpdater = () => {
  logger.info('======== registerUpdater START ========')
  if (disabled) {
    logger.info('updater disabled, maybe in dev mode, directly pass')
    return
  }

  autoUpdater.logger = logger
  // autoUpdater.logger.transports.file.level = 'info'

  const allowAutoUpdate = true

  autoUpdater.autoDownload = false
  autoUpdater.allowPrerelease = channel !== 'stable'
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.autoRunAppAfterInstall = true

  // const feedUrl: Exclude<Parameters<typeof autoUpdater.setFeedURL>[0], string> = {
  // channel,
  // provider: 'generic',
  // url: import.meta.env.VITE_UPDATE_URL,
  // This setting seems to be ineffective
  // updaterCacheDirName: import.meta.env.DEV ? 'klee-updater-dev' : 'klee-updater',
  // }

  // logger.debug('auto-updater feed config', {
  //   ...feedUrl,
  //   // updateProvider: undefined,
  // })

  // autoUpdater.setFeedURL(feedUrl)

  // register events for checkForUpdates
  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for update')
  })
  // New version available
  autoUpdater.on('update-available', (info) => {
    logger.info('Update available', info)
    if (config.autoDownloadUpdate && allowAutoUpdate) {
      downloadUpdate().catch((err) => {
        logger.error(err)
      })
    }
  })
  // No new version
  autoUpdater.on('update-not-available', (info) => {
    logger.info('Update not available', info)
  })
  // Download progress
  autoUpdater.on('download-progress', (e) => {
    // logger.info(`Download progress: ${e.percent}`)
    const mainWindow = getMainWindow()
    if (!mainWindow) return
    mainWindow.webContents.send('download-progress', e)
  })
  // Update package download completed
  autoUpdater.on('update-downloaded', () => {
    downloading = false
    downloaded = true
    logger.info('Update downloaded, ready to install')

    getMainWindow()?.webContents.send('update-downloaded')
  })
  // Error checking for updates
  autoUpdater.on('error', (e) => {
    logger.error('Error while updating client', e)
  })
  autoUpdater.forceDevUpdateConfig = isDev

  setInterval(() => {
    if (config.autoCheckUpdate) {
      checkForUpdates().catch((err) => {
        logger.error('Error checking for updates', err)
      })
    }
  }, config.checkUpdateInterval)
  if (config.autoCheckUpdate) {
    checkForUpdates().catch((err) => {
      logger.error('Error checking for updates', err)
    })
  }
  logger.info('======== registerUpdater END ========')
}
