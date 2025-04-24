import { IDownloadProgress } from '@/types'
import { llmFolderPath } from './appPath'
import electronDl, { download, DownloadOptions } from './download'
import { getMainWindow } from './window'
import Logger from 'electron-log/main'
import path from 'path'
import fs from 'fs/promises'
const logger = Logger.scope('[main] electron-downloader')

const downloadItems = new Map()
const downloadingItems = new Map<string, boolean>()

const downloadOptions: DownloadOptions = {
  overwrite: true,
  directory: llmFolderPath,
  onStarted: async (item_) => {
    logger.log('download started', item_.getURL(), item_.getSavePath())

    const item = downloadItems.has(item_.getURL()) ? downloadItems.get(item_.getURL()) : item_
    downloadItems.set(item.getURL(), item)

    const downloadProgress: IDownloadProgress = {
      name: item.getFilename(),
      received: item.getReceivedBytes(),
      total: item.getTotalBytes(),
      savePath: item.getSavePath(),
      url: item.getURL(),
      state: 'progressing',
    }
    const mainWindow = getMainWindow()
    mainWindow?.webContents.send('downloader::event::progress', downloadProgress)
  },
  onProgress: (item) => {
    const downloadProgress: IDownloadProgress = {
      name: item.getFilename(),
      received: item.getReceivedBytes(),
      total: item.getTotalBytes(),
      savePath: item.getSavePath(),
      url: item.getURL(),
      state: 'progressing',
    }
    // logger.log('downloader:progress', downloadProgress)
    const mainWindow = getMainWindow()
    mainWindow?.webContents.send('downloader::event::progress', downloadProgress)
  },
  onCompleted: (item) => {
    const downloadProgress: IDownloadProgress = {
      name: item.getFilename(),
      received: item.getReceivedBytes(),
      total: item.getTotalBytes(),
      savePath: item.getSavePath(),
      url: item.getURL(),
      state: 'completed',
    }
    const mainWindow = getMainWindow()
    mainWindow?.webContents.send('downloader::event::progress', downloadProgress)
    downloadingItems.delete(item.getURL())
  },
}

export function registerElectronDownloader() {
  electronDl(downloadOptions)
}

export const pauseDownload = async (_: unknown, { url }: { url: IDownloadProgress['url'] }) => {
  downloadingItems.set(url, false)
  const item = downloadItems.get(url)
  console.log('[main] pauseDownload', url, item)
  if (item) {
    item.pause()

    const downloadProgress: IDownloadProgress = {
      name: item.getFilename(),
      received: item.getReceivedBytes(),
      total: item.getTotalBytes(),
      savePath: item.getSavePath(),
      url: item.getURL(),
      state: 'paused',
    }
    const mainWindow = getMainWindow()
    mainWindow?.webContents.send('downloader::event::progress', downloadProgress)
  }
}

export const resumeDownload = async (_: unknown, { url }: { url: IDownloadProgress['url']; length?: number }) => {
  const isDownloading = downloadingItems.get(url)
  logger.log('downloader:resume', url, isDownloading)
  if (isDownloading) {
    return
  }
  downloadingItems.set(url, true)

  // const item = downloadItems.get(url)
  const item = downloadItems.has(url) ? downloadItems.get(url) : null
  logger.log('downloader:resume', url, item)
  // If there's still data during runtime, resume the download
  if (item) {
    item.resume()
    const downloadProgress: IDownloadProgress = {
      name: item.getFilename(),
      received: item.getReceivedBytes(),
      total: item.getTotalBytes(),
      savePath: item.getSavePath(),
      url: item.getURL(),
      state: 'progressing',
    }
    const mainWindow = getMainWindow()
    mainWindow?.webContents.send('downloader::event::progress', downloadProgress)
  } else {
    // mainWindow?.webContents.session.downloadURL(url)
    const mainWindow = getMainWindow()
    if (!mainWindow) return
    // Otherwise restart the download
    // Path is split by / directly because the path is from the URL link
    const filename = url.split('/').pop() || ''
    await deleteFileLlm(filename)
    download(mainWindow, url, downloadOptions)
  }
}

export const startDownload = async (_: unknown, { url }: { url: IDownloadProgress['url'] }) => {
  const isDownloading = downloadingItems.get(url)
  if (isDownloading) {
    return
  }
  downloadingItems.set(url, true)

  const mainWindow = getMainWindow()
  if (!mainWindow) return
  download(mainWindow, url, downloadOptions)
}

export async function deleteFileLlm(filename: string): Promise<void> {
  try {
    const filePath = path.join(llmFolderPath, filename)
    await fs.rm(filePath)
    downloadItems.delete(filename)
    downloadingItems.delete(filename)
  } catch (error) {
    // Failure is normal as the file may not exist
    // Logger.info('delete file error: ', error)
  }
}
