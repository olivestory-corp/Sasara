import supabase from '../supabaseClient'
const defaultEmbedModel = 'all-MiniLM-L6-v2'
import { embedModelFolderPath, downloadEmbedModelDestinationPath } from '../appPath'
import fs from 'fs'
import { Downloader } from '../utils/downloader'
import path from 'path'
import { BrowserWindow } from 'electron'
import { IEmbedModelUpdaterStatus, IKernelUpdaterStatus } from 'electron/types'
import { IDownloadProgress } from '@/types'
import { getMainWindow } from '../window'
import Logger from 'electron-log/main'
import { Extractor } from '../kernel/extractor'

const logger = Logger.scope('[main] embedModel')

const extractor = new Extractor()

interface EmbedModelInfo {
  id: string
  name: string
  description: string
  weight: number
  download_url: string
}

const defaultEmbedModelInfo = {
  id: '1d1fad3b-55b1-4702-947c-6197de8d9c0c',
  name: 'all-MiniLM-L6-v2',
  description: 'all-MiniLM-L6-v2',
  weight: 9,
  download_url: 'https://kerneldownload.sasaradesktop.com/all-MiniLM-L6-v2.zip',
  created_at: '2024-11-25T07:50:44.438412+00:00',
  updated_at: '2024-11-25T07:50:44.438412+00:00',
}

// Add status update function
function sendStatusToRenderer(window: BrowserWindow | null, status: IEmbedModelUpdaterStatus) {
  if (!window) return
  window.webContents.send('embed-model-updater-status-change', status)
}

export async function checkIfNeededDownloadEmbedModel() {
  logger.info('[EmbedModel] => check if needed download embed model')
  // 1. Check if model exists
  const modelList = await fetchEmbedModelList()
  const exists = await checkIfModelExist(modelList)
  if (exists) {
    logger.info('[EmbedModel] => embed model already exists')
    return
  }
  // 2. Download model
  const modelInfo = await fetchModelInfo(defaultEmbedModel)
  if (!modelInfo) {
    logger.error('[EmbedModel] => default embed model not found')
    return
  }
  // 3. Download model
  const window = BrowserWindow.getFocusedWindow()
  await downloadEmbedModel(modelInfo, window)
}

async function checkIfModelExist(modelList: EmbedModelInfo[]): Promise<boolean> {
  try {
    // Check if embedModelFolderPath exists
    if (!fs.existsSync(embedModelFolderPath)) {
      logger.info(`Model directory does not exist: ${embedModelFolderPath}`)
      return false
    }

    // If model list is empty, return false directly
    if (!modelList || modelList.length === 0) {
      return false
    }

    // Get all folders in directory
    const existingDirs = await fs.promises.readdir(embedModelFolderPath, { withFileTypes: true })
    const existingDirNames = existingDirs.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)

    // Check if any model folder exists
    const exists = modelList.some((model) => existingDirNames.includes(model.name))

    logger.info(`Check if model exists: ${exists ? 'exists' : 'does not exist'}`)
    return exists
  } catch (error) {
    logger.error('Error checking if model exists:', error)
    return false
  }
}

async function fetchEmbedModelList(): Promise<EmbedModelInfo[]> {
  if (!supabase) return [defaultEmbedModelInfo]
  const { data, error } = await supabase.from('embed_models').select('*')
  if (error) {
    logger.error('[EmbedModel] => fetch embed model list failed', error)
    return [defaultEmbedModelInfo]
  }
  if (!data) return [defaultEmbedModelInfo]
  return data
}

async function fetchModelInfo(name: string) {
  if (!supabase) {
    return defaultEmbedModelInfo
  }
  const { data, error } = await supabase
    .from('embed_models')
    .select('*')
    .eq('name', name)
    .order('weight', { ascending: false })

  if (error) {
    logger.error('[EmbedModel] => fetch model info failed', error)
  }
  if (!data || data.length === 0) {
    logger.error('[EmbedModel] => model info not found', name)
    return defaultEmbedModelInfo
  }
  return data[0]
}

async function downloadEmbedModel(modelInfo: EmbedModelInfo, window: BrowserWindow | null) {
  try {
    logger.info('[EmbedModel] => start download embed model:', modelInfo.name)

    const modelPath = path.join(downloadEmbedModelDestinationPath, `${modelInfo.name}.zip`)
    const downloader = new Downloader()

    await downloader.download(modelInfo.download_url, modelPath, (status: IKernelUpdaterStatus) => {
      if (status.status === 'downloading' && status.downloadProgress) {
        const progress: IDownloadProgress = {
          state: status.status === 'downloading' ? 'progressing' : 'completed',
          received: status.downloadProgress.transferred,
          total: status.downloadProgress.total,
          url: modelInfo.download_url,
          name: modelInfo.name,
          savePath: modelPath,
        }

        sendStatusToRenderer(window, {
          status: 'downloading',
          message: 'Downloading embed model...',
          downloadProgress: progress,
        })

        // logger.info(
        //   `[EmbedModel] => downloading ${modelInfo.name}: ${status.downloadProgress.percent.toFixed(2)}%, ` +
        //     `${(status.downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s`,
        // )
      }
    })

    sendStatusToRenderer(window, {
      status: 'completed',
      message: 'Embed model downloaded',
    })

    logger.info('[EmbedModel] => download completed:', modelInfo.name)
    return modelPath
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred')
    logger.error('[EmbedModel] => download failed:', error)
    sendStatusToRenderer(window, {
      status: 'error',
      message: 'Download failed',
      error,
    })
    throw error
  }
}

async function unzipFile(zipPath: string) {
  // Check if embedModelFolderPath exists, if not, create the folder
  if (!fs.existsSync(embedModelFolderPath)) {
    await fs.promises.mkdir(embedModelFolderPath, { recursive: true })
    logger.info('[EmbedModel] => create embed model folder:', embedModelFolderPath)
  }

  await extractor.extract(zipPath, embedModelFolderPath, (status: IKernelUpdaterStatus) => {
    logger.info('[EmbedModel] => unzip progress:', status)
    // TODO: Whether to render to UI
  })
  try {
    await fs.promises.unlink(zipPath)
    logger.info('[EmbedModel] => delete zip file:', zipPath)
  } catch (error) {
    logger.error('[EmbedModel] => delete zip file failed:', error)
  }
}

// Add IPC processing function
export async function handleEmbedModelUpdater() {
  const window = getMainWindow()
  try {
    sendStatusToRenderer(window, {
      status: 'checking',
      message: 'Checking embed model...',
    })

    logger.info('[EmbedModel] => start fetch embed model list')
    const modelList = await fetchEmbedModelList()
    logger.info('[EmbedModel] => fetch embed model list completed', modelList)

    logger.info('[EmbedModel] => start check if model exists')
    const exists = await checkIfModelExist(modelList)
    logger.info('[EmbedModel] => check if model exists completed', exists)
    if (exists) {
      sendStatusToRenderer(window, {
        status: 'completed',
        message: 'Embed model already exists',
      })
      return
    }

    const modelInfo = await fetchModelInfo(defaultEmbedModel)
    if (!modelInfo) {
      throw new Error('Default embed model not found')
    }

    const modelPath = await downloadEmbedModel(modelInfo, window)
    // Unzip
    await unzipFile(modelPath)
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred')
    logger.error('[EmbedModel] => update failed:', error)
    sendStatusToRenderer(window, {
      status: 'error',
      message: 'Update failed',
      error,
    })
  }
}
