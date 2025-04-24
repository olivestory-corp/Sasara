import { useQuery } from '@tanstack/react-query'
import { compareVersionLt } from '@/lib/utils'
import { useIpcListener } from '@/hooks/use-ipc-listener'
import {
  IElectronUpdaterStatus,
  IKernelHeartbeatStatus,
  IKernelUpdaterStatus,
  IModelUpdaterStatus,
  IPipelineUpdaterStatus,
  IEmbedModelUpdaterStatus,
  IOllamaUpdaterStatus,
} from 'electron/types'
import { IDownloadProgress, ILlmModel, ILlmModelWithDownloader, IProgressInfo, IUpdateCheckResult } from '@/types'
import { useMemo, useState } from 'react'
import { getHeartbeat } from '@/services/status'
import { useTranslation } from 'react-i18next'
import { useConfig } from '@/hooks/use-config'
import { useKleeLlmModels } from '@/hooks/use-klee-llm'

import { atom, useAtom } from 'jotai'
import { useInvalidateOllamaModels } from './use-ollama'

export const isDownloadingUpdateAtom = atom<boolean>(false)
export const isUpdateDownloadedAtom = atom<boolean>(false)
export const updateDownloadProgressAtom = atom<IProgressInfo | null>(null)

export function useElectronUpdater() {
  const { t } = useTranslation()
  const [retryTime, setRetryTime] = useState(0)

  // Check remote version information
  const {
    data: updateCheckResult,
    isPending: isCheckingForUpdates,
    error: checkForUpdatesError,
  } = useQuery<IUpdateCheckResult | null>({
    queryKey: ['updateInfo', retryTime],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      try {
        const result = await window.ipcRenderer.invoke('check-for-updates')
        console.log('[renderer] check-for-updates result', result)
        return result || null
      } catch (error) {
        console.log('[renderer] check-for-updates error', error)
        // if network not connect, skip
        return null
      }
    },
  })
  const updateInfo = updateCheckResult?.updateInfo

  // Get local version information
  const { data: appVersion, isPending: isGettingAppVersion } = useQuery<string>({
    queryKey: ['appVersion', retryTime],
    queryFn: async () => {
      const version = await window.ipcRenderer.invoke('get-app-version')
      return version
    },
  })

  // Whether checking for updates
  const isCheckingAvailable = useMemo(() => {
    return isCheckingForUpdates || isGettingAppVersion
  }, [isCheckingForUpdates, isGettingAppVersion])

  // Whether update is available
  const isUpdateAvailable = useMemo(() => {
    if (checkForUpdatesError) {
      console.error('[renderer] check-for-updates error=', checkForUpdatesError)
      return false
    }
    if (!updateInfo) return false
    if (!appVersion) return false

    return compareVersionLt(appVersion, updateInfo.version)
  }, [updateInfo, appVersion, checkForUpdatesError])

  const [isDownloadingUpdate, setIsDownloadingUpdate] = useAtom(isDownloadingUpdateAtom)
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useAtom(isUpdateDownloadedAtom)
  const [updateDownloadProgress, setUpdateDownloadProgress] = useAtom(updateDownloadProgressAtom)

  const handleUpdateDownloadProgress = (_: unknown, progress: IProgressInfo) => {
    // When download starts, set download status
    if (!isDownloadingUpdate) {
      setIsDownloadingUpdate(true)
    }
    setUpdateDownloadProgress(progress)
    console.log('[renderer] update download progress', progress.percent, progress.bytesPerSecond, progress.total)
  }

  const handleDownloadUpdate = () => {
    if (isDownloadingUpdate) return
    setIsDownloadingUpdate(true)

    // Not necessarily starting download again, it might be ready to restart after download. Need to check download progress to determine whether to start download or restart
    console.log('[renderer] try to download update...')
    window.ipcRenderer.invoke('download-update')
  }

  // Check and start download
  // useEffect(() => {
  //   if (isUpdateAvailable) {
  //     handleDownloadUpdate()
  //   }
  // }, [isUpdateAvailable])
  // useQuery({
  //   queryKey: ['handleDownloadUpdate', isUpdateAvailable],
  //   queryFn: () => {
  //     if (!isUpdateAvailable) return
  //     return handleDownloadUpdate()
  //   },
  // })

  const handleUpdateDownloaded = () => {
    setIsDownloadingUpdate(false)
    setIsUpdateDownloaded(true)
    console.log('[renderer] update downloaded, quit and install after 2 seconds')

    window.ipcRenderer.invoke('quit-and-install')
  }

  useIpcListener('download-progress', handleUpdateDownloadProgress)
  useIpcListener('update-downloaded', handleUpdateDownloaded)

  const status: IElectronUpdaterStatus['status'] = isCheckingAvailable
    ? 'checking'
    : isDownloadingUpdate
    ? 'downloading'
    : isUpdateDownloaded
    ? 'completed'
    : checkForUpdatesError
    ? 'error'
    : isUpdateAvailable
    ? 'waiting-download'
    : 'no-update'

  const getMessageFromStatus = (status: IElectronUpdaterStatus['status']) => {
    const statusMessageMap: Record<IElectronUpdaterStatus['status'], string> = {
      checking: t('onboarding.checkingVersion'),
      downloading: t('onboarding.downloadingUpdate'),
      completed: t('onboarding.updateDownloaded'),
      error: t('onboarding.updateFailed'),
      'no-update': t('onboarding.noUpdate'),
      'waiting-download': t('onboarding.waitingDownload'),
    }
    return statusMessageMap[status] || ''
  }

  const electronUpdaterStatus: IElectronUpdaterStatus = {
    status,
    message: getMessageFromStatus(status),
    downloadProgress: updateDownloadProgress || undefined,
    error: checkForUpdatesError || undefined,
  }

  const handleResetElectronUpdater = () => {
    setIsDownloadingUpdate(false)
    setIsUpdateDownloaded(false)
    setUpdateDownloadProgress(null)
    setRetryTime((time) => time + 1)
  }

  return {
    status: electronUpdaterStatus,
    trigger: handleDownloadUpdate,
    reset: handleResetElectronUpdater,
  }
}

const defaultKernelUpdaterStatus: IKernelUpdaterStatus = {
  status: 'waiting-check',
  message: '',
}
const kernelUpdaterStatusAtom = atom<IKernelUpdaterStatus>(defaultKernelUpdaterStatus)

export function useKernelUpdater() {
  const { t } = useTranslation()

  const getMessageFromStatus = (status: IKernelUpdaterStatus['status'], error?: IKernelUpdaterStatus['error']) => {
    const statusMessageMap: Record<IKernelUpdaterStatus['status'], string> = {
      'waiting-check': t('onboarding.checkingKernel'),
      checking: t('onboarding.checkingKernel'),
      downloading: t('onboarding.downloadingKernel'),
      completed: t('onboarding.kernelDownloaded'),
      error: t('onboarding.kernelUpdateFailed') + (error ? `: ${error.message}` : ''),
      extracting: t('onboarding.extractingKernel'),
    }
    return statusMessageMap[status] || ''
  }
  const [kernelUpdaterStatus = defaultKernelUpdaterStatus, setKernelUpdaterStatus] = useAtom(kernelUpdaterStatusAtom)

  useIpcListener('kernel-updater-status-change', (_, status: IKernelUpdaterStatus) => {
    // console.log('[renderer] kernel-updater-status-change', status)
    setKernelUpdaterStatus({
      ...status,
      message: getMessageFromStatus(status.status, status.error),
    })
  })

  const triggerFetchKernelUpdaterStatus = () => {
    console.log('[renderer] fetch kernel updater status')
    window.ipcRenderer.invoke('fetch-kernel-updater-status')
  }

  const handleResetKernelUpdater = () => {
    setKernelUpdaterStatus(defaultKernelUpdaterStatus)
  }

  return {
    status: kernelUpdaterStatus,
    trigger: triggerFetchKernelUpdaterStatus,
    reset: handleResetKernelUpdater,
  }
}

const defaultOllamaUpdaterStatus: IOllamaUpdaterStatus = {
  status: 'waiting-check',
  message: '',
}
const ollamaUpdaterStatusAtom = atom<IOllamaUpdaterStatus>(defaultOllamaUpdaterStatus)

export function useOllamaUpdater() {
  const { t } = useTranslation()
  const invalidateOllamaModels = useInvalidateOllamaModels()

  const getMessageFromStatus = (status: IOllamaUpdaterStatus['status'], error?: IOllamaUpdaterStatus['error']) => {
    const statusMessageMap: Record<IOllamaUpdaterStatus['status'], string> = {
      'waiting-check': t('onboarding.checkingOllama'),
      checking: t('onboarding.checkingOllama'),
      downloading: t('onboarding.downloadingOllama'),
      completed: t('onboarding.ollamaDownloaded'),
      error: t('onboarding.ollamaUpdateFailed') + (error ? `: ${error.message}` : ''),
      extracting: t('onboarding.extractingOllama'),
      running: t('onboarding.runningOllama'),
    }
    return statusMessageMap[status] || ''
  }

  const [
    ollamaUpdaterStatus = {
      status: 'waiting-check',
      message: getMessageFromStatus('waiting-check'),
    },
    setOllamaUpdaterStatus,
  ] = useAtom(ollamaUpdaterStatusAtom)

  useIpcListener('ollama-updater-status-change', (_, status: IOllamaUpdaterStatus) => {
    setOllamaUpdaterStatus({
      ...status,
      message: getMessageFromStatus(status.status, status.error),
    })
    if (status.status === 'completed') {
      invalidateOllamaModels()
    }
  })

  const triggerFetchOllamaUpdaterStatus = () => {
    console.log('[renderer] fetch ollama updater status')
    window.ipcRenderer.invoke('fetch-ollama-update-status')
  }

  const handleResetOllamaUpdater = () => {
    setOllamaUpdaterStatus(defaultOllamaUpdaterStatus)
  }

  return {
    status: ollamaUpdaterStatus,
    trigger: triggerFetchOllamaUpdaterStatus,
    reset: handleResetOllamaUpdater,
  }
}

const heartbeatEnabledAtom = atom<boolean>(false)
export function useHeartbeat() {
  const [enabled, setEnabled] = useAtom(heartbeatEnabledAtom)
  const { t } = useTranslation()

  // Heartbeat detection
  const { data: heartbeat } = useQuery<{ status: string } | null>({
    queryKey: ['heartbeat'],
    queryFn: () => {
      return getHeartbeat()
    },
    // Retry indefinitely on failure
    retry: true,
    // Check every two seconds on failure
    retryDelay: 2000,
    enabled,
  })

  const getMessageFromStatus = (status: IKernelHeartbeatStatus['status']) => {
    const statusMessageMap: Record<IKernelHeartbeatStatus['status'], string> = {
      connecting: t('onboarding.connectingService'),
      connected: t('onboarding.serviceConnected'),
      waiting: t('onboarding.waitingService'),
    }
    return statusMessageMap[status] || ''
  }
  const status = !enabled ? 'waiting' : heartbeat ? 'connected' : 'connecting'
  const heartbeatStatus: IKernelHeartbeatStatus = {
    status,
    message: getMessageFromStatus(status),
  }

  const triggerFetchHeartbeat = () => {
    setEnabled(true)
  }

  const handleResetHeartbeat = () => {
    setEnabled(false)
  }

  return {
    status: heartbeatStatus,
    trigger: triggerFetchHeartbeat,
    reset: handleResetHeartbeat,
  }
}

const modelUpdaterDownloadProgressAtom = atom<IDownloadProgress | null>(null)
function useModelUpdaterEnable() {
  const electronUpdater = useElectronUpdater()
  const isElectronUpdaterCompleted = electronUpdater.status.status === 'no-update'
  const kernelUpdater = useKernelUpdater()
  const isKernelUpdaterCompleted = kernelUpdater.status.status === 'completed'
  const enable = isElectronUpdaterCompleted && isKernelUpdaterCompleted
  return enable
}
export function useModelUpdater() {
  const enable = useModelUpdaterEnable()

  const { t } = useTranslation()
  const [downloadProgress, setDownloadProgress] = useAtom(modelUpdaterDownloadProgressAtom)
  const [config] = useConfig()

  const { data: kleeLlmModels, isPending: isFetchingKleeLlmModels } = useKleeLlmModels()

  const modelShouldDownload = useMemo(() => {
    if (!enable) return null
    if (!config.privateMode) return null
    if (!kleeLlmModels) return null

    const downloadedKleeLlmModels = kleeLlmModels.filter((model) => model.downloadCompleted) || []
    const maxWeightModel =
      downloadedKleeLlmModels.length === 0
        ? kleeLlmModels.reduce<ILlmModel | null>(
            (prev, curr) => ((prev?.weight || 0) > (curr?.weight || 0) ? prev : curr),
            null,
          )
        : null

    return downloadedKleeLlmModels.length === 0 ? maxWeightModel : null
  }, [kleeLlmModels, config.privateMode, enable])

  const modelShouldDownloadUrl = useMemo(() => {
    if (!modelShouldDownload) return null
    return modelShouldDownload.download_url
  }, [modelShouldDownload])

  const triggerDownloadModel = () => {
    if (!modelShouldDownloadUrl) return
    window.ipcRenderer.invoke('downloader:resume', { url: modelShouldDownloadUrl })
  }

  useIpcListener('downloader::event::progress', (_, data: IDownloadProgress) => {
    if (data.url !== modelShouldDownloadUrl) return
    setDownloadProgress(data)
  })

  // const progressValue = downloadProgress ? Math.min(100, (downloadProgress.received / downloadProgress.total) * 100) : 0
  const isDownloadInProgress = downloadProgress
    ? downloadProgress.state !== 'completed'
    : isFetchingKleeLlmModels
    ? true
    : modelShouldDownload
    ? true
    : false

  const getMessageFromStatus = (status: IModelUpdaterStatus['status']) => {
    const statusMessageMap: Record<IModelUpdaterStatus['status'], string> = {
      downloading: t('onboarding.downloadingModel'),
      completed: t('onboarding.modelDownloaded'),
      error: t('onboarding.modelDownloadFailed'),
      checking: t('onboarding.checkingModel'),
    }
    return statusMessageMap[status] || ''
  }

  const status = isFetchingKleeLlmModels ? 'checking' : isDownloadInProgress ? 'downloading' : 'completed'
  const modelUpdaterStatus: IModelUpdaterStatus = {
    status,
    downloadProgress: downloadProgress || undefined,
    message: getMessageFromStatus(status),
  }

  return {
    status: modelUpdaterStatus,
    trigger: triggerDownloadModel,
  }
}

const downloadProgressMapAtom = atom<Map<string, IDownloadProgress | null>>(new Map())
const downloadStatusMapAtom = atom<Map<string, 'downloading' | 'completed' | 'error' | 'paused' | 'waiting'>>(new Map())
export function useModelUpdaterWithDownloader() {
  const [downloadProgressMap, setDownloadProgressMap] = useAtom(downloadProgressMapAtom)
  const [downloadStatusMap, setDownloadStatusMap] = useAtom(downloadStatusMapAtom)
  const { data: kleeLlmModels, isPending: isFetchingKleeLlmModels } = useKleeLlmModels()
  const kleeLlmModelsWithDownloader: ILlmModelWithDownloader[] = useMemo(() => {
    if (!kleeLlmModels) return []
    const models = kleeLlmModels.map((model) => {
      const downloadProgress = downloadProgressMap.get(model.download_url || '')
      const isDownloadFinished = model.stat?.data ? model.stat.data?.stats.size >= model.store_size : false
      const isDownloadNotFinished = model.stat?.data
        ? model.stat.data.stats.size > 0 && model.stat.data.stats.size < model.store_size
        : false
      const downloadStatus =
        downloadStatusMap.get(model.download_url || '') ||
        (isDownloadFinished ? 'completed' : isDownloadNotFinished ? 'paused' : 'waiting')
      return {
        ...model,
        disabled: downloadStatus !== 'completed',
        downloadProgress,
        downloadStatus,
      }
    })
    return models
  }, [kleeLlmModels, downloadProgressMap, downloadStatusMap])

  useIpcListener('downloader::event::progress', (_, data: IDownloadProgress) => {
    // console.log('[renderer] downloader::event::progress', data)
    setDownloadProgressMap((downloadProgressMap) => {
      downloadProgressMap.set(data.url, data)
      return new Map(downloadProgressMap)
    })
    // console.log('[renderer] downloader::event::progress', data)
    setDownloadStatusMap((downloadStatusMap) => {
      downloadStatusMap.set(
        data.url,
        data.state === 'completed' ? 'completed' : data.state === 'paused' ? 'paused' : 'downloading',
      )
      return new Map(downloadStatusMap)
    })
  })

  const triggerDownloadModel = (url: string) => {
    const model = kleeLlmModelsWithDownloader.find((model) => model.download_url === url)
    if (!model) return

    console.info('[renderer] trigger download model', model.download_url, model.store_size)
    window.ipcRenderer.invoke('downloader:resume', { url: model.download_url, length: model.store_size })
    setDownloadStatusMap((downloadStatusMap) => {
      downloadStatusMap.set(model.download_url, 'downloading')
      return new Map(downloadStatusMap)
    })
  }

  const triggerPauseDownloadModel = (url: string) => {
    const model = kleeLlmModelsWithDownloader.find((model) => model.download_url === url)
    if (!model) return

    console.info('[renderer] trigger pause download model', url)
    window.ipcRenderer.invoke('downloader:pause', { url: model.download_url })
    setDownloadStatusMap((downloadStatusMap) => {
      downloadStatusMap.set(url, 'paused')
      return new Map(downloadStatusMap)
    })
  }

  return {
    data: kleeLlmModelsWithDownloader,
    isPending: isFetchingKleeLlmModels,
    triggerDownloadModel,
    triggerPauseDownloadModel,
  }
}
export function useMaxWeightModelWithDownloader() {
  const {
    data: kleeLlmModelsWithDownloader,
    triggerPauseDownloadModel,
    triggerDownloadModel,
  } = useModelUpdaterWithDownloader()
  const maxWeightModel: ILlmModelWithDownloader | undefined = useMemo(() => {
    return kleeLlmModelsWithDownloader.reduce((max, model) => {
      return max.weight > model.weight ? max : model
    }, kleeLlmModelsWithDownloader[0])
  }, [kleeLlmModelsWithDownloader])

  return {
    data: maxWeightModel,
    triggerDownloadModel: () => triggerDownloadModel(maxWeightModel?.download_url || ''),
    triggerPauseDownloadModel: () => triggerPauseDownloadModel(maxWeightModel?.download_url || ''),
  }
}
export function useIsEmptyModelWithDownloader() {
  const { data: kleeLlmModelsWithDownloader } = useModelUpdaterWithDownloader()
  return kleeLlmModelsWithDownloader.filter((model) => model.downloadStatus === 'completed').length === 0
}

export function usePipeline() {
  // const [searchParams] = useSearchParams()
  // const skipModelDownload = parseInt(searchParams.get('skipModelDownload') || '0') === 1
  const electronUpdater = useElectronUpdater()
  const kernelUpdater = useKernelUpdater()
  const ollamaUpdater = useOllamaUpdater()
  // const modelUpdater = useModelUpdater()
  const embedModelUpdater = useEmbedModelUpdater()
  const [config] = useConfig()
  const isPrivateMode = config.privateMode

  const isElectronUpdaterCompleted =
    electronUpdater.status.status === 'no-update' || electronUpdater.status.status === 'error'
  const isKernelUpdaterCompleted = kernelUpdater.status.status === 'completed'
  const isEmbedModelUpdaterCompleted = embedModelUpdater.status.status === 'completed'
  const isOllamaUpdaterCompleted = ollamaUpdater.status.status === 'completed' || !isPrivateMode
  // || ollamaUpdater.status.status === 'error'
  // const isModelUpdaterCompleted = modelUpdater.status.status === 'completed' || skipModelDownload

  const getUpdaterStatus = (): IPipelineUpdaterStatus['status'] => {
    const lastUpdaterStatus = 'kernel-heartbeat'
    const checks = [
      { condition: !isElectronUpdaterCompleted, status: 'electron-update' },
      { condition: !isEmbedModelUpdaterCompleted, status: 'embed-model-update' },
      { condition: !isOllamaUpdaterCompleted, status: 'ollama-update' },
      { condition: !isKernelUpdaterCompleted, status: 'kernel-update' },
      // { condition: !isModelUpdaterCompleted && isPrivateMode, status: 'model-update' },
      { condition: true, status: lastUpdaterStatus },
    ] as const

    const matchedCheck = checks.find((check) => check.condition)
    return matchedCheck?.status || lastUpdaterStatus
  }

  const pipelineUpdaterStatus: IPipelineUpdaterStatus = {
    status: getUpdaterStatus(),
  }

  return { status: pipelineUpdaterStatus }
}

const defaultEmbedModelUpdaterStatus: IEmbedModelUpdaterStatus = {
  status: 'waiting-check',
  message: '',
}
const embedModelUpdaterStatusAtom = atom<IEmbedModelUpdaterStatus>(defaultEmbedModelUpdaterStatus)
const embedModelDownloadProgressAtom = atom<IDownloadProgress | null>(null)
export function useEmbedModelUpdater() {
  const { t } = useTranslation()
  const [embedModelUpdaterStatus, setEmbedModelUpdaterStatus] = useAtom(embedModelUpdaterStatusAtom)
  const [downloadProgress, setDownloadProgress] = useAtom(embedModelDownloadProgressAtom)

  const getMessageFromStatus = (status: IEmbedModelUpdaterStatus['status']) => {
    const statusMessageMap: Record<IEmbedModelUpdaterStatus['status'], string> = {
      'waiting-check': t('onboarding.checkingEmbedModel'),
      checking: t('onboarding.checkingEmbedModel'),
      downloading: t('onboarding.downloadingEmbedModel'),
      completed: t('onboarding.embedModelDownloaded'),
      error: t('onboarding.embedModelDownloadFailed'),
    }
    return statusMessageMap[status] || ''
  }

  const triggerDownloadEmbedModel = () => {
    return window.ipcRenderer.invoke('fetch-embed-model-updater-status')
  }

  useIpcListener('embed-model-updater-status-change', (_, status: IEmbedModelUpdaterStatus) => {
    setEmbedModelUpdaterStatus((prevStatus) => ({
      ...prevStatus,
      ...status,
      message: getMessageFromStatus(status.status),
    }))
    setDownloadProgress(status.downloadProgress || null)
  })

  // const status = downloadProgress ? (downloadProgress.state !== 'completed' ? 'downloading' : 'completed') : 'checking'
  const handleResetEmbedModelUpdater = () => {
    setEmbedModelUpdaterStatus(defaultEmbedModelUpdaterStatus)
    setDownloadProgress(null)
  }

  return {
    status: {
      ...embedModelUpdaterStatus,
      downloadProgress,
    },
    trigger: triggerDownloadEmbedModel,
    reset: handleResetEmbedModelUpdater,
  }
}

export function useResetPipeline() {
  const electronUpdater = useElectronUpdater()
  const kernelUpdater = useKernelUpdater()
  const ollamaUpdater = useOllamaUpdater()
  const embedModelUpdater = useEmbedModelUpdater()

  const resetPipeline = () => {
    electronUpdater.reset()
    kernelUpdater.reset()
    ollamaUpdater.reset()
    embedModelUpdater.reset()
  }
  return resetPipeline
}
