import process from 'node:process'
import path from 'node:path'
import { app, BrowserWindow, shell, dialog } from 'electron'
import { unusedFilenameSync } from 'unused-filename'
import pupa from 'pupa'
// @ts-ignore
import extName from 'ext-name'

export class CancelError extends Error {}

export interface DownloadOptions {
  showBadge?: boolean
  showProgressBar?: boolean
  directory?: string | (() => string)
  filename?: string
  overwrite?: boolean
  saveAs?: boolean
  dialogOptions?: Electron.SaveDialogOptions
  errorMessage?: string
  errorTitle?: string
  openFolderWhenDone?: boolean
  unregisterWhenDone?: boolean
  onProgress?: (item: Electron.DownloadItem, progress: DownloadProgress) => void
  onTotalProgress?: (progress: DownloadProgress) => void
  onStarted?: (item: Electron.DownloadItem) => void
  onCancel?: (item: Electron.DownloadItem) => void
  onCompleted?: (item: Electron.DownloadItem) => void
}

interface DownloadProgress {
  percent: number
  transferredBytes: number
  totalBytes: number
}

interface DownloadCompletedItem {
  fileName: string // Backward compatibility
  filename: string
  path: string
  fileSize: number
  mimeType: string
  url: string
}

const getFilenameFromMime = (name: string, mime: string): string => {
  const extensions = extName.mime(mime)

  if (extensions.length !== 1) {
    return name
  }

  return `${name}.${extensions[0].ext}`
}

function registerListener(
  session: Electron.Session,
  options: DownloadOptions,
  callback: (error: Error | null, item?: Electron.DownloadItem) => void = () => {},
) {
  const downloadItems = new Set<Electron.DownloadItem>()
  let receivedBytes = 0
  let completedBytes = 0
  let totalBytes = 0
  const activeDownloadItems = () => downloadItems.size
  const progressDownloadItems = () => receivedBytes / totalBytes

  options = {
    showBadge: true,
    showProgressBar: true,
    ...options,
  }

  const listener = (event: Electron.Event, item: Electron.DownloadItem, webContents: Electron.WebContents) => {
    downloadItems.add(item)
    totalBytes += item.getTotalBytes()

    const window_ = BrowserWindow.fromWebContents(webContents)
    if (!window_) {
      throw new Error('Failed to get window from web contents.')
    }

    // support callable directory
    const directory_ = typeof options.directory === 'function' ? options.directory() : options.directory

    if (directory_ && !path.isAbsolute(directory_)) {
      throw new Error('The `directory` option must be an absolute path')
    }

    const directory = directory_ ?? app.getPath('downloads')

    let filePath
    if (options.filename) {
      filePath = path.join(directory, options.filename)
    } else {
      const filename = item.getFilename()
      const name = path.extname(filename) ? filename : getFilenameFromMime(filename, item.getMimeType())

      filePath = options.overwrite ? path.join(directory, name) : unusedFilenameSync(path.join(directory, name))
    }

    const errorMessage = options.errorMessage ?? 'The download of {filename} was interrupted'

    if (options.saveAs) {
      item.setSaveDialogOptions({ defaultPath: filePath, ...options.dialogOptions })
    } else {
      item.setSavePath(filePath)
    }

    item.on('updated', () => {
      receivedBytes = completedBytes
      for (const item of downloadItems) {
        receivedBytes += item.getReceivedBytes()
      }

      if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
        app.badgeCount = activeDownloadItems()
      }

      if (!window_.isDestroyed() && options.showProgressBar) {
        window_.setProgressBar(progressDownloadItems())
      }

      if (typeof options.onProgress === 'function') {
        const itemTransferredBytes = item.getReceivedBytes()
        const itemTotalBytes = item.getTotalBytes()

        options.onProgress(item, {
          percent: itemTotalBytes ? itemTransferredBytes / itemTotalBytes : 0,
          transferredBytes: itemTransferredBytes,
          totalBytes: itemTotalBytes,
        })
      }

      if (typeof options.onTotalProgress === 'function') {
        options.onTotalProgress({
          percent: progressDownloadItems(),
          transferredBytes: receivedBytes,
          totalBytes,
        })
      }
    })

    item.on('done', (event, state) => {
      completedBytes += item.getTotalBytes()
      downloadItems.delete(item)

      if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
        app.badgeCount = activeDownloadItems()
      }

      if (!window_.isDestroyed() && !activeDownloadItems()) {
        window_.setProgressBar(-1)
        receivedBytes = 0
        completedBytes = 0
        totalBytes = 0
      }

      if (options.unregisterWhenDone) {
        session.removeListener('will-download', listener)
      }

      if (state === 'cancelled') {
        if (typeof options.onCancel === 'function') {
          options.onCancel(item)
        }

        callback(new CancelError())
      } else if (state === 'interrupted') {
        const message = pupa(errorMessage, { filename: path.basename(filePath) })
        callback(new Error(message))
      } else if (state === 'completed') {
        const savePath = item.getSavePath()

        if (process.platform === 'darwin') {
          app.dock.downloadFinished(savePath)
        }

        if (options.openFolderWhenDone) {
          shell.showItemInFolder(savePath)
        }

        if (typeof options.onCompleted === 'function') {
          options.onCompleted(item)
        }

        callback(null, item)
      }
    })

    if (typeof options.onStarted === 'function') {
      options.onStarted(item)
    }
  }

  session.on('will-download', listener)
}

export default function electronDl(options: DownloadOptions = {}) {
  app.on('session-created', (session) => {
    registerListener(session, options, (error, _) => {
      if (error && !(error instanceof CancelError)) {
        const errorTitle = options.errorTitle ?? 'Download Error'
        dialog.showErrorBox(errorTitle, error.message)
      }
    })
  })
}

export async function download(
  window_: BrowserWindow,
  url: string,
  options?: DownloadOptions,
): Promise<Electron.DownloadItem> {
  return new Promise((resolve, reject) => {
    options = {
      ...options,
      unregisterWhenDone: true,
    }

    registerListener(window_.webContents.session, options, (error, item) => {
      if (error) {
        reject(error)
      } else {
        resolve(item as Electron.DownloadItem)
      }
    })

    window_.webContents.downloadURL(url)
  })
}
