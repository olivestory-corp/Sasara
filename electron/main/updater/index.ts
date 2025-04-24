import { getAutoUpdater } from './auto-updater'
import { channel, isWindows } from '../env'
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

  // 플랫폼별 latest.yml 파일 설정
  const updateConfig = {
    provider: 'generic',
    url: 'https://olivedownlod.s3.ap-northeast-2.amazonaws.com',
    channel: isWindows ? 'windows' : 'mac',
  }

  autoUpdater.setFeedURL(updateConfig)

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    logger.info('Update available:', info)
    getMainWindow()?.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    logger.info('Update not available:', info)
    getMainWindow()?.webContents.send('update-not-available', info)
  })

  autoUpdater.on('error', (err) => {
    logger.error('Error in auto-updater:', err)
    getMainWindow()?.webContents.send('update-error', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    logger.info('Download progress:', progressObj)
    getMainWindow()?.webContents.send('download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    logger.info('Update downloaded:', info)
    downloaded = true
    downloading = false
    getMainWindow()?.webContents.send('update-downloaded', info)
  })

  if (allowAutoUpdate) {
    autoUpdater.checkForUpdates()
  }
}
