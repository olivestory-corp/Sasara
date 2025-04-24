import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs/promises'
import Logger from 'electron-log/main'
import { fileURLToPath } from 'url'
const logger = Logger.scope('[main] appPath')

if (process.platform === 'darwin') {
  const oldUserDataPath = app.getPath('userData')
  app.setPath('userData', path.join(oldUserDataPath, '..', 'com.signerlabs.klee'))
}

export const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const APP_ROOT = path.join(__dirname, '../..')
export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
export const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST
export const preload = path.join(__dirname, '../preload/index.mjs')
export const indexHtml = path.join(RENDERER_DIST, 'index.html')

export const appFolder = getAppFolder('')
logger.info('appFolder:', appFolder)

export const executablePath = getExecutablePath()
logger.info('executablePath:', executablePath)

export const ollamaSavedPath = getOllamaSavedPath()
logger.info('ollamaSavedPath:', ollamaSavedPath)

export const ollamaExtractDestinationPath = getOllamaExtractDestinationPath()
logger.info('ollamaExtractDestinationPath:', ollamaExtractDestinationPath)

export const ollamaExecutablePath = getOllamaExecutablePath()
logger.info('ollamaExecutablePath:', ollamaExecutablePath)

export const loggerFilePath = getLoggerFilePath()
logger.info('loggerFilePath:', loggerFilePath)

export const downloadMainServiceDestinationPath = getDownloadMainServiceDestinationPath()
logger.info('downloadMainServiceDestinationPath:', downloadMainServiceDestinationPath)

export const serviceExtractDestinationPath = getServiceExtractDestinationPath()
logger.info('serviceExtractDestinationPath:', serviceExtractDestinationPath)

export const serviceFolderPath = getServiceFolderPath()
logger.info('serviceFolderPath:', serviceFolderPath)

export const llmFolderPath = getAppFolder('llm')
logger.info('llmFolderPath:', llmFolderPath)

export const iconPath = getIconPath()
logger.info('iconPath:', iconPath)

export const versionFilePath = getVersionFilePath()
logger.info('versionFilePath:', versionFilePath)

export const embedModelFolderPath = getEmbedModelFolderPath()
logger.info('embedModelFolderPath:', embedModelFolderPath)

export const downloadEmbedModelDestinationPath = getDownloadEmbedModelDestinationPath()
logger.info('downloadEmbedModelDestinationPath:', downloadEmbedModelDestinationPath)

export const ollamaVersionFilePath = getOllamaVersionFilePath()
logger.info('ollamaVersionFilePath:', ollamaVersionFilePath)

function getAppFolder(foldername: string) {
  if (process.platform === 'win32') {
    return path.join(app.getPath('userData'), '../..', '/Local/com/signer_labs/klee', foldername)
  } else {
    // app.getPath('userData') === /Users/{username}/Library/Application Support/com.signerlabs.klee/
    return path.join(app.getPath('userData'), foldername)
  }
}

// Executable file path
function getExecutablePath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'main/main')
  } else {
    logger.info('Windows startup path: ', path.join(app.getAppPath(), '../../', 'main.exe'))
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/main/main.exe')
  }
}

function getOllamaSavedPath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'ollama-latest/ollama-darwin.tgz')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-ollama/ollama-windows-amd64.zip')
  }
}

function getOllamaExtractDestinationPath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'ollama-latest/ollama-darwin')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-ollama/ollama-windows-amd64')
  }
}

function getOllamaExecutablePath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'ollama-latest/ollama-darwin/ollama')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-ollama/ollama-windows-amd64/ollama.exe')
  }
}

// Version file path
function getVersionFilePath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'main/version')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/main/version')
  }
}

function getLoggerFilePath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'logs', `main.log`)
  } else {
    return path.join(app.getAppPath(), '../../../', `klee-kernel/logs/main.log`)
  }
}

function getDownloadMainServiceDestinationPath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'temp')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/version')
  }
}

function getServiceExtractDestinationPath() {
  if (process.platform === 'darwin') {
    return getAppFolder('')
  } else {
    // In development mode, this path needs to be concatenated with a third parameter, which can be any folder
    // return path.join(app.getAppPath(), '../../', 'temp_main')
    // In production mode, this path doesn't need to be concatenated with a third parameter
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/main')
  }
}

function getServiceFolderPath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'main')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/main')
  }
}

function getIconPath() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(app.getAppPath(), './build/icons/512x512.png')
  } else {
    if (process.platform === 'darwin') {
      return path.join(app.getAppPath(), './Resources/icon.icns')
    }
    return path.join(app.getAppPath(), './Resources/icon.png')
  }
}

export async function checkIfNeededCreateEmbedModelFolder() {
  const embedModelFolderPath = getEmbedModelFolderPath()

  try {
    await fs.access(embedModelFolderPath)
    logger.info('[embed model folder check] => exists:', embedModelFolderPath)
  } catch {
    try {
      await fs.mkdir(embedModelFolderPath, { recursive: true, mode: 0o755 })
      logger.info('[embed model folder check] => created embed model folder:', embedModelFolderPath)
    } catch (error) {
      logger.error('[embed model folder check] => failed to create embed model folder:', error)
      throw error
    }
  }
}

async function checkIfNeededMoveTikTokenFolder() {
  const tikTokenFolderPath = path.join(getAppFolder(''), 'tiktoken_encode')
  try {
    await fs.access(tikTokenFolderPath)
    logger.info('[tik token folder check] => exists:', tikTokenFolderPath)
  } catch {
    try {
      // Get source folder path (from application resources directory)
      const sourcePath =
        process.env.NODE_ENV === 'development'
          ? path.join(APP_ROOT, 'additionalResources/tiktoken_encode') // Development environment: from project root
          : path.join(app.getAppPath(), '../additionalResources/tiktoken_encode') // Production environment: from application resources directory, not considering Windows, Windows is handled separately
      logger.info('[tik token folder check] => sourcePath:', sourcePath)
      // Ensure target parent folder exists
      await fs.mkdir(path.dirname(tikTokenFolderPath), { recursive: true })

      // Copy entire folder
      await fs.cp(sourcePath, tikTokenFolderPath, {
        recursive: true,
        force: true,
        preserveTimestamps: true,
      })

      logger.info('[tik token folder check] => copied from:', sourcePath)
      logger.info('[tik token folder check] => copied to:', tikTokenFolderPath)
    } catch (error) {
      logger.error('[tik token folder check] => failed to copy folder:', error)
      throw error
    }
  }
}

function getEmbedModelFolderPath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'embed_model')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/embed_model')
  }
}

function getDownloadEmbedModelDestinationPath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'temp')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-kernel/version')
  }
}

function getOllamaVersionFilePath() {
  if (process.platform === 'darwin') {
    return path.join(getAppFolder(''), 'ollama-latest/version.json')
  } else {
    return path.join(app.getAppPath(), '../../../', 'klee-ollama/version.json')
  }
}

export async function registerAppFolder() {
  logger.info('======== registerAppFolder START ========')
  process.env.APP_ROOT = APP_ROOT
  process.env.VITE_PUBLIC = VITE_PUBLIC

  try {
    await fs.access(appFolder)
    logger.info('access success: ', appFolder)
  } catch {
    try {
      await fs.mkdir(appFolder, { recursive: true, mode: 0o755 })
      logger.info('mkdir success: ', appFolder)
    } catch (error) {
      logger.error('mkdir failed: ', error)
    }
  }
  await checkIfNeededCreateEmbedModelFolder()
  if (process.platform === 'darwin') {
    await checkIfNeededMoveTikTokenFolder()
  }
  logger.info('======== registerAppFolder END ========')
}
