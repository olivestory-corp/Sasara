import { Downloader } from '../utils/downloader'
import Logger from 'electron-log/main'
import { ollamaExecutablePath, ollamaExtractDestinationPath, ollamaSavedPath, ollamaVersionFilePath } from '../appPath'
import { getMainWindow } from '../window'
import { extractAndRunProgram } from './exectutor'
import { Extractor } from './extractor'
import { access, constants } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { IOllamaVersionInfo } from 'electron/types'
import yaml from 'js-yaml'

const logger = Logger.scope('[main] ollama')

const execAsync = promisify(exec)
const extractor = new Extractor()
const downloader = new Downloader()
const DARWIN_DOWNLOAD_URL = 'https://dvnr1hi9fanyr.cloudfront.net/ollama/ollama-darwin.tgz'
const WINDOWS_DOWNLOAD_URL = 'https://dvnr1hi9fanyr.cloudfront.net/ollama/ollama-windows-amd64.zip'
const VERSION_CHECK_URL = 'https://dvnr1hi9fanyr.cloudfront.net/ollama/version.yml'
const downloadUrl = process.platform === 'darwin' ? DARWIN_DOWNLOAD_URL : WINDOWS_DOWNLOAD_URL

async function getRemoteVersionInfo(): Promise<IOllamaVersionInfo | null> {
  try {
    logger.info(`Checking remote version from: ${VERSION_CHECK_URL}`)
    const response = await fetch(VERSION_CHECK_URL)

    if (!response.ok) {
      logger.error(`Failed to fetch version info: ${response.status} ${response.statusText}`)
      return null
    }

    const yamlText = await response.text()
    const versionInfo = yaml.load(yamlText) as IOllamaVersionInfo

    logger.info(`Remote version info: ${JSON.stringify(versionInfo)}`)
    return versionInfo
  } catch (error) {
    logger.error('Failed to get remote version info', error)
    return null
  }
}

async function getLocalVersionInfo(): Promise<IOllamaVersionInfo | null> {
  try {
    if (!fs.existsSync(ollamaVersionFilePath)) {
      logger.info(`Local version file not found: ${ollamaVersionFilePath}`)
      return null
    }

    const versionData = await fs.promises.readFile(ollamaVersionFilePath, 'utf-8')
    const versionInfo = JSON.parse(versionData) as IOllamaVersionInfo

    logger.info(`Local version info: ${JSON.stringify(versionInfo)}`)
    return versionInfo
  } catch (error) {
    logger.error('Failed to get local version info', error)
    return null
  }
}

async function saveLocalVersionInfo(versionInfo: IOllamaVersionInfo): Promise<void> {
  try {
    // Ensure directory exists
    const dirPath = path.dirname(ollamaVersionFilePath)
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true })
    }

    await fs.promises.writeFile(ollamaVersionFilePath, JSON.stringify(versionInfo, null, 2), 'utf-8')
    logger.info(`Saved local version info: ${JSON.stringify(versionInfo)}`)
  } catch (error) {
    logger.error('Failed to save local version info', error)
    throw error
  }
}

async function isUpdateRequired(): Promise<{ needUpdate: boolean; remoteVersion: IOllamaVersionInfo | null }> {
  const remoteVersion = await getRemoteVersionInfo()
  const localVersion = await getLocalVersionInfo()

  if (!remoteVersion) {
    logger.info('No remote version info available, skipping update check')
    return { needUpdate: false, remoteVersion: null }
  }

  if (!localVersion) {
    logger.info('No local version info available, update required')
    return { needUpdate: true, remoteVersion }
  }

  const needUpdate = remoteVersion.version !== localVersion.version
  logger.info(`Update check: local=${localVersion.version}, remote=${remoteVersion.version}, needUpdate=${needUpdate}`)

  return { needUpdate, remoteVersion }
}

async function getDownloadUrlFromVersion(versionInfo: IOllamaVersionInfo): Promise<string> {
  if (process.platform === 'darwin' && versionInfo.darwin_url) {
    return versionInfo.darwin_url
  } else if (process.platform === 'win32' && versionInfo.windows_url) {
    return versionInfo.windows_url
  }

  // Fallback to default URLs if specific ones are not provided
  return process.platform === 'darwin' ? DARWIN_DOWNLOAD_URL : WINDOWS_DOWNLOAD_URL
}

async function downloadService(downloadUrl: string) {
  try {
    logger.info(`start download file: ${downloadUrl}`)
    logger.info(`download target path: ${ollamaSavedPath}`)

    const downloadedPath = await downloader.download(downloadUrl, ollamaSavedPath, (status) => {
      getMainWindow()?.webContents.send('ollama-updater-status-change', status)
    })

    // Processing after download completion
    logger.info(`download completed: ${downloadedPath}`)
    return downloadedPath
  } catch (error) {
    logger.error('download service failed', error)
    throw error
  }
}

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

    // Finally try to delete empty directory
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

export async function extractService(zipPath: string) {
  // logger.info(`start extract file: ${zipPath}`)
  const destPath = ollamaExtractDestinationPath
  logger.info(`extract target path: ${destPath}`)
  try {
    // Clean up target directory
    // await extractor.cleanDestination(serviceFolderPath)
    // Check permissions before cleaning up target directory
    if (fs.existsSync(destPath)) {
      try {
        await checkAndFixPermissions(destPath)
        await recursiveCleanup(destPath)
      } catch (cleanError: unknown) {
        logger.error('clean target directory failed', cleanError)
        throw new Error(
          `cannot clean target directory: ${cleanError instanceof Error ? cleanError.message : String(cleanError)}`,
        )
      }
    }
    logger.info(`start extract file: ${zipPath} -> ${destPath}`)
    const result = await extractor.extract(zipPath, destPath, (status) => {
      getMainWindow()?.webContents.send('ollama-updater-status-change', status)

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

let globalOllamaPath: string | null = null
function getGlobalOllamaPath() {
  if (globalOllamaPath) {
    return globalOllamaPath
  }

  const envPath = process.env.PATH || ''
  const paths = envPath.split(path.delimiter)
  for (const p of paths) {
    const ollamaPath = path.join(p, process.platform === 'win32' ? 'ollama.exe' : 'ollama')
    if (fs.existsSync(ollamaPath)) {
      globalOllamaPath = ollamaPath
      return ollamaPath
    }
  }
}

// Get from environment variables
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'

// 0: Download and start local ollama
// 1: Start local ollama directly
// 2: Start global ollama
// 3: ollama already running
export async function isUpdateAvailable() {
  // Check API directly
  try {
    await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    logger.info('use ollama service directly')
    return 3
  } catch (error) {
    // @ts-ignore
  }

  // First check if the target directory exists
  if (fs.existsSync(ollamaExtractDestinationPath)) {
    logger.info('use local ollama service', ollamaExtractDestinationPath)
    return 1
  }

  // Check if ollama exists in the PATH environment variable
  const ollamaPath = getGlobalOllamaPath()
  if (ollamaPath) {
    logger.info('use global ollama service', ollamaPath)
    return 2
  }

  logger.info('need to update ollama')
  return 0
}

export async function handleOllamaUpdater() {
  try {
    getMainWindow()?.webContents.send('ollama-updater-status-change', {
      status: 'checking',
      message: 'Checking Ollama installation and version...',
    })

    const available = await isUpdateAvailable()
    logger.info('ollama updater available', available)

    if (available === 0 || available === 1) {
      // Check if update is required
      getMainWindow()?.webContents.send('ollama-updater-status-change', {
        status: 'checking',
        message: 'Checking for Ollama updates...',
      })

      const { needUpdate, remoteVersion } = await isUpdateRequired()

      if (remoteVersion) {
        getMainWindow()?.webContents.send('ollama-updater-status-change', {
          status: 'checking',
          message: `Found remote version: ${remoteVersion.version}${
            needUpdate ? ' (update available)' : ' (up to date)'
          }`,
        })
      }

      // 如果是 available === 1 且不需要更新，直接启动本地服务
      if (available === 1 && !needUpdate) {
        getMainWindow()?.webContents.send('ollama-updater-status-change', {
          status: 'running',
          message: 'Running local Ollama',
        })

        // Start the program
        await extractAndRunProgram(ollamaExecutablePath)
      }
      // 如果需要更新或者 available === 0（需要下载）
      else if (needUpdate || available === 0) {
        if (remoteVersion) {
          getMainWindow()?.webContents.send('ollama-updater-status-change', {
            status: 'downloading',
            message: `Downloading Ollama version ${remoteVersion.version}`,
          })

          // Get download URL from version info
          const versionSpecificUrl = await getDownloadUrlFromVersion(remoteVersion)

          // Download ollama
          const downloadedPath = await downloadService(versionSpecificUrl)

          getMainWindow()?.webContents.send('ollama-updater-status-change', {
            status: 'extracting',
            message: `Extracting Ollama version ${remoteVersion.version}`,
          })
          await extractService(downloadedPath)

          // Save version info after successful extraction
          await saveLocalVersionInfo(remoteVersion)

          getMainWindow()?.webContents.send('ollama-updater-status-change', {
            status: 'running',
            message: `Running Ollama version ${remoteVersion.version}`,
          })

          // Start the program
          await extractAndRunProgram(ollamaExecutablePath)
        } else {
          // No version info available, but still need to download
          getMainWindow()?.webContents.send('ollama-updater-status-change', {
            status: 'downloading',
            message: 'Downloading Ollama (no version info available)',
          })

          // Download ollama using default URL
          const downloadedPath = await downloadService(downloadUrl)

          getMainWindow()?.webContents.send('ollama-updater-status-change', {
            status: 'extracting',
            message: 'Extracting Ollama',
          })
          await extractService(downloadedPath)

          getMainWindow()?.webContents.send('ollama-updater-status-change', {
            status: 'running',
            message: 'Running Ollama',
          })

          // Start the program
          await extractAndRunProgram(ollamaExecutablePath)
        }
      }
    } else if (available === 2) {
      getMainWindow()?.webContents.send('ollama-updater-status-change', {
        status: 'checking',
        message: 'Found global Ollama installation',
      })

      getMainWindow()?.webContents.send('ollama-updater-status-change', {
        status: 'running',
        message: 'Running global Ollama',
      })

      // Start the program
      const ollamaPath = getGlobalOllamaPath()
      logger.info('use global ollama service and try to run', ollamaPath, available, globalOllamaPath)
      if (ollamaPath) {
        await extractAndRunProgram(ollamaPath)
      } else {
        throw new Error('global ollama path not found')
      }
    } else if (available === 3) {
      getMainWindow()?.webContents.send('ollama-updater-status-change', {
        status: 'checking',
        message: 'Ollama service is already running',
      })

      getMainWindow()?.webContents.send('ollama-updater-status-change', {
        status: 'completed',
        message: 'Using existing Ollama service',
      })
      return
    }

    getMainWindow()?.webContents.send('ollama-updater-status-change', {
      status: 'completed',
      message: 'Ollama setup completed',
    })
  } catch (error) {
    logger.error('check update service failed', error)
    getMainWindow()?.webContents.send('ollama-updater-status-change', {
      status: 'error',
      error,
      message: `Ollama setup failed: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}
