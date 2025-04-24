import { IDownloadProgress } from '@/types'
import { ProgressResponse } from 'ollama'

export interface IKernelUpdaterDownloadProgress {
  transferred: number
  total: number
  percent: number
  bytesPerSecond: number
}

export interface IKernelUpdaterExtractionProgress {
  percent: number
  extractedFiles: number
  totalFiles: number
  currentFile: string
}

export interface IKernelUpdaterStatus {
  status: 'waiting-check' | 'checking' | 'downloading' | 'extracting' | 'completed' | 'error'
  downloadProgress?: IKernelUpdaterDownloadProgress
  extractionProgress?: IKernelUpdaterExtractionProgress
  error?: Error
  message?: string
}

export interface IOllamaUpdaterStatus {
  status: 'waiting-check' | 'checking' | 'downloading' | 'running' | 'completed' | 'error' | 'extracting'
  downloadProgress?: IKernelUpdaterDownloadProgress
  extractionProgress?: IKernelUpdaterExtractionProgress
  error?: Error
  message?: string
}

export interface IElectronUpdaterStatus {
  status: 'checking' | 'downloading' | 'completed' | 'no-update' | 'error' | 'waiting-download'
  downloadProgress?: IKernelUpdaterDownloadProgress
  error?: Error
  message?: string
}

export interface IKernelHeartbeatStatus {
  status: 'connecting' | 'connected' | 'waiting'
  message: string
}

export interface IModelUpdaterStatus {
  status: 'checking' | 'downloading' | 'completed' | 'error'
  downloadProgress?: IDownloadProgress
  error?: Error
  message?: string
}

export interface IPipelineUpdaterStatus {
  status:
    | 'electron-update'
    | 'kernel-update'
    | 'model-update'
    | 'embed-model-update'
    | 'kernel-heartbeat'
    | 'ollama-update'
}

export interface IEmbedModelUpdaterStatus {
  status: 'waiting-check' | 'checking' | 'downloading' | 'completed' | 'error'
  message: string
  downloadProgress?: IDownloadProgress
  error?: Error
}

export interface AbortableAsyncIterator<T> {
  abort(): void
  [Symbol.asyncIterator](): AsyncGenerator<T, void, unknown>
}

export interface OllamaProgressResponse {
  name: string
  progress?: ProgressResponse
  error?: string
}

export interface IOllamaVersionInfo {
  version: string
  darwin_url?: string
  windows_url?: string
  linux_url?: string
  release_date?: string
  release_notes?: string
}
