import {
  versionFilePath,
  downloadMainServiceDestinationPath,
  serviceExtractDestinationPath,
  serviceFolderPath,
} from '../appPath'
import fs from 'fs'
import Logger from 'electron-log/main'
import { Downloader } from './downloader'
import path from 'path'
import { Extractor } from './extractor'
import { getMainWindow } from '../window'
import { access, constants } from 'fs/promises'
import { extractAndRunProgram } from './executor'
import { exec } from 'child_process'
import { promisify } from 'util'
import { isDev } from '../env'

const logger = Logger.scope('[main] kernel updater')
const execAsync = promisify(exec)

// 커널 버전과 다운로드 URL 상수 정의
const KERNEL_VERSION = '1.0.4'
const KERNEL_DOWNLOAD_URL = 'https://olivedownlod.s3.ap-northeast-2.amazonaws.com/main(1.0.4).zip'
const KERNEL_DOWNLOAD_URL_MAC = 'https://olivedownlod.s3.ap-northeast-2.amazonaws.com/main-darwin(1.0.4).zip'

async function checkAndFixPermissions(dirPath: string): Promise<void> {
  try {
    await access(dirPath, constants.W_OK)
  } catch (error) {
    logger.info(`try to fix directory permission: ${dirPath}`)

    if (process.platform === 'darwin' || process.platform === 'linux') {
      try {
        // Use system command to modify permissions
        const username = process.env.USER || process.env.USERNAME
        await execAsync(`chmod -R 755 "${dirPath}"`)
        await execAsync(`chown -R ${username} "${dirPath}"`)
        logger.info(`fix directory permission: ${dirPath}`)
      } catch (cmdError) {
        logger.error(`execute command failed`, cmdError)
        // If the command fails, try to force delete
        try {
          await fs.promises.rm(dirPath, { recursive: true, force: true })
          logger.info(`force remove success: ${dirPath}`)
        } catch (rmError) {
          logger.error(`force remove failed: ${dirPath}`, rmError)
          throw new Error(`cannot access or delete file/directory: ${dirPath}`)
        }
      }
    } else if (process.platform === 'win32') {
      try {
        await execAsync(`icacls "${dirPath}" /grant Everyone:F /T`)
      } catch (winError) {
        try {
          await fs.promises.rm(dirPath, { recursive: true, force: true })
        } catch (rmError) {
          throw new Error(`cannot access or delete file/directory: ${dirPath}`)
        }
      }
    }
  }
}

async function recursiveCleanup(dirPath: string): Promise<void> {
  try {
    // First try to force delete directly
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true })
      logger.info(`success delete directory: ${dirPath}`)
      return
    } catch (directRemoveError) {
      logger.warn(`direct remove failed, try to delete item by item: ${dirPath}`)
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      try {
        await checkAndFixPermissions(fullPath)
        if (entry.isDirectory()) {
          await recursiveCleanup(fullPath)
        } else {
          await fs.promises.unlink(fullPath)
        }
      } catch (error) {
        logger.warn(`handle path failed: ${fullPath}`, error)
      }
    }

    // Last try to delete empty directory
    try {
      await fs.promises.rmdir(dirPath)
    } catch (rmdirError) {
      logger.warn(`delete directory failed: ${dirPath}`, rmdirError)
    }
  } catch (error) {
    logger.error(`recursive cleanup failed: ${dirPath}`, error)
    throw error
  }
}

function compareVersionLt(v1: string, v2: string) {
  const v1Parts = v1.split('.')
  const v2Parts = v2.split('.')
  for (let i = 0; i < v1Parts.length; i++) {
    const v1Part = parseInt(v1Parts[i], 10)
    const v2Part = parseInt(v2Parts[i], 10)
    if (v1Part < v2Part) return true
    if (v1Part > v2Part) return false
  }
  return false
}

const extractor = new Extractor()

function getDatabaseTableName() {
  if (process.env.NODE_ENV === 'development') {
    return 'service_release_version'
  } else {
    return 'service_release_version'
  }
}

interface ServiceVersion {
  version: string
  download_url: string
}

function getLocalVersion(): string {
  try {
    const version = fs.readFileSync(versionFilePath, 'utf-8')
    if (version === '') {
      return '0.0.0'
    }
    return version
  } catch (error) {
    logger.error('read local version failed', error)
    return '0.0.0'
  }
}

async function getServiceVersion(): Promise<ServiceVersion | null> {
  // 하드코딩된 버전 정보 반환
  return {
    version: KERNEL_VERSION,
    download_url: process.platform === 'darwin' ? KERNEL_DOWNLOAD_URL_MAC : KERNEL_DOWNLOAD_URL,
  }

  // TODO: Supabase 연동 코드 (나중에 사용)
  /*
  const tableName = getDatabaseTableName()
  logger.info(`get latest version from ${tableName} table`)
  let platform = ''
  if (process.platform === 'darwin') {
    platform = `${process.platform}-${process.arch}`
  } else {
    // TODO: - Windows server architecture
    platform = 'win32-x64'
  }
  logger.info(`Getting latest service version for platform [${platform}]`)
  if (!supabaseClient) return null
  const { data, error } = await supabaseClient
    .from(tableName)
    .select()
    .eq('platform', platform)
    .order('created_at', { ascending: false })
  if (error) {
    throw error
  }
  if (data.length === 0) {
    throw new Error(`no service version found for platform: ${platform}`)
  }
  logger.log('get service version', data[0])
  return data[0]
  */
}

const downloader = new Downloader()

async function downloadService(downloadUrl: string, version: string) {
  try {
    const fileName = `main(${version}).zip`
    const filePath = path.join(downloadMainServiceDestinationPath, fileName)

    logger.info(`start download file: ${downloadUrl}`)
    logger.info(`download target path: ${filePath}`)

    const downloadedPath = await downloader.download(downloadUrl, filePath)

    // Processing after download completion
    logger.info(`download completed: ${downloadedPath}`)
    return downloadedPath
  } catch (error) {
    logger.error('download service failed', error)
    throw error
  }
}

export async function extractService(zipPath: string) {
  // logger.info(`start extract file: ${zipPath}`)
  const destPath = serviceExtractDestinationPath
  logger.info(`extract target path: ${destPath}`)
  try {
    // Clean up target directory
    // await extractor.cleanDestination(serviceFolderPath)
    // Check permissions before cleaning up target directory
    if (fs.existsSync(serviceFolderPath)) {
      try {
        await checkAndFixPermissions(serviceFolderPath)
        await recursiveCleanup(serviceFolderPath)
      } catch (cleanError: unknown) {
        logger.error('clean target directory failed', cleanError)
        throw new Error(
          `cannot clean target directory: ${cleanError instanceof Error ? cleanError.message : String(cleanError)}`,
        )
      }
    }
    logger.info(`start extract file: ${zipPath} -> ${serviceExtractDestinationPath}`)
    const result = await extractor.extract(zipPath, serviceExtractDestinationPath, (status) => {
      getMainWindow()?.webContents.send('kernel-updater-status-change', status)

      // Log recording
      // if (status.status === 'extracting' && status.extractionProgress) {
      //   logger.info(
      //     `extraction progress: ${status.extractionProgress.percent.toFixed(2)}%, ` +
      //       `${status.extractionProgress.extractedFiles}/${status.extractionProgress.totalFiles} files, ` +
      //       `current: ${status.extractionProgress.currentFile}`,
      //   )
      // } else if (status.extractionProgress && status.extractionProgress.percent === 100) {
      //   logger.info('extract completed')
      // } else if (status.extractionProgress && status.status === 'error') {
      //   logger.error('extract error', status.error)
      // }
    })

    // Delete downloaded files after extraction
    try {
      await fs.promises.unlink(zipPath)
      logger.info(`delete zip file: ${zipPath}`)
    } catch (deleteError) {
      logger.warn(`delete zip file failed: ${zipPath}`, deleteError)
      // Here we only record warnings, not throw errors because the main task (extraction) has been completed
    }

    return result
  } catch (error) {
    logger.error('extract service failed', error)
    throw error
  }
}

export async function isUpdateAvailable() {
  try {
    logger.info('start check update service')
    const localVersion = getLocalVersion()
    const serviceVersion = await getServiceVersion()
    if (!serviceVersion) return false

    logger.info(`local version: ${localVersion}, cloud version: ${serviceVersion.version}`)
    const cloudVersion = serviceVersion.version
    const isUpdateAvailable = compareVersionLt(localVersion, cloudVersion)
    return isUpdateAvailable
  } catch (error) {
    logger.error('check update service failed', error)
    return false
  }
}

async function downloadUpdate() {
  const serviceVersion = await getServiceVersion()
  if (!serviceVersion) return null
  const downloadUrl = serviceVersion.download_url
  const downloadedPath = await downloadService(downloadUrl, serviceVersion.version)
  return downloadedPath
}

const disabled = isDev

// const disabled = false
export async function fetchUpdaterStatus() {
  try {
    getMainWindow()?.webContents.send('kernel-updater-status-change', {
      status: 'checking',
    })

    if (!disabled) {
      const available = await isUpdateAvailable()
      if (available) {
        const downloadedPath = await downloadUpdate()
        if (!downloadedPath) return
        getMainWindow()?.webContents.send('kernel-updater-status-change', {
          status: 'extracting',
        })
        await extractService(downloadedPath)
      }

      // Start the program
      await extractAndRunProgram()
    }

    getMainWindow()?.webContents.send('kernel-updater-status-change', {
      status: 'completed',
    })
  } catch (error) {
    logger.error('check update service failed', error)
    getMainWindow()?.webContents.send('kernel-updater-status-change', {
      status: 'error',
      error,
    })
  }
}
