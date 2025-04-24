import fs from 'fs'
import path from 'path'
import Logger from 'electron-log/main'
import { getMainWindow } from '../window'
import { IKernelUpdaterStatus } from 'electron/types'

const logger = Logger.scope('[main] Commons downloader')

export class Downloader {
  private abortController: AbortController | null = null
  private downloadedBytes = 0
  private startTime = 0

  constructor() {}

  private async getFileSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return parseInt(response.headers.get('content-length') || '0')
    } catch (error) {
      logger.error('get file size failed:', error)
      throw error
    }
  }

  private calculateSpeed(downloadedBytes: number): number {
    const now = Date.now()
    const timeElapsed = (now - this.startTime) / 1000 // Convert to seconds
    return timeElapsed > 0 ? downloadedBytes / timeElapsed : 0
  }

  async download(url: string, filePath: string, onProgress?: (status: IKernelUpdaterStatus) => void): Promise<string> {
    try {
      this.abortController = new AbortController()
      this.startTime = Date.now()

      // Ensure target directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true })

      // Get file size
      const totalBytes = await this.getFileSize(url)
      logger.info(`file total size: ${totalBytes} bytes`)

      // Check if there's an incomplete download
      let fileExists = false
      try {
        const stats = await fs.promises.stat(filePath)
        fileExists = stats.size > 0
        this.downloadedBytes = stats.size
      } catch {
        this.downloadedBytes = 0
      }

      // Validate the downloaded portion
      if (fileExists && this.downloadedBytes >= totalBytes) {
        logger.info('file is fully downloaded')
        return filePath
      }

      // Create or open file
      const fileStream = fs.createWriteStream(filePath, {
        flags: fileExists ? 'r+' : 'w',
        start: this.downloadedBytes,
      })

      // Single request download
      const response = await fetch(url, {
        headers:
          this.downloadedBytes > 0
            ? {
                Range: `bytes=${this.downloadedBytes}-${totalBytes - 1}`,
              }
            : {},
        signal: this.abortController.signal,
      })

      if (!response.ok && response.status !== 206) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('cannot get response stream')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Write to file
          await new Promise<void>((resolve, reject) => {
            fileStream.write(value, (error) => {
              if (error) reject(error)
              else resolve()
            })
          })

          this.downloadedBytes += value.length

          // Calculate and notify progress
          const status: IKernelUpdaterStatus = {
            status: 'downloading',
            downloadProgress: {
              transferred: this.downloadedBytes,
              total: totalBytes,
              percent: (this.downloadedBytes / totalBytes) * 100,
              bytesPerSecond: this.calculateSpeed(this.downloadedBytes),
            },
          }
          // console.log('=========status', status)

          if (onProgress) {
            onProgress(status)
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Complete download
      await new Promise<void>((resolve, reject) => {
        fileStream.end((error: Error | null) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // Validate file size
      const finalStats = await fs.promises.stat(filePath)
      if (finalStats.size !== totalBytes) {
        throw new Error(`download file size mismatch: expect ${totalBytes} bytes, actual ${finalStats.size} bytes`)
      }

      // logger.info('download completed:', filePath)
      // logger.info(`file size validation: ${finalStats.size} bytes`)

      const win = getMainWindow()
      if (win) {
        win.webContents.send('backend-download-completed', filePath)
      }
      return filePath
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.info('download canceled')
      } else {
        logger.error('download failed:', error)
      }
      throw error
    }
  }

  cancel() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}
