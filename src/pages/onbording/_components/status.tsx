import { Progress } from '@/components/ui/progress'
import {
  useElectronUpdater,
  useHeartbeat,
  useKernelUpdater,
  useModelUpdater,
  useEmbedModelUpdater,
  useMaxWeightModelWithDownloader,
  useOllamaUpdater,
  useResetPipeline,
} from '@/hooks/use-updater'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ILlmModelWithDownloader } from '@/types'
import { useNavigate } from 'react-router-dom'
import { EnumRouterLink } from '@/constants/paths'
import { useTranslation } from 'react-i18next'

function StatusPanel({
  showProgress,
  percent,
  label,
  error,
}: {
  showProgress: boolean
  percent: number
  label: string
  error?: string
}) {
  const { t } = useTranslation()
  const resetPipeline = useResetPipeline()
  return (
    <div className="flex w-full flex-col space-y-4">
      {showProgress && <Progress value={percent} />}
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground">{label}</Label>
        {error && (
          <Button
            variant="link"
            onClick={() => {
              resetPipeline()
            }}
          >
            {t('common.retry')}
          </Button>
        )}
      </div>
    </div>
  )
}

export function ElectronUpdaterStatus() {
  const { status: electronUpdaterStatus } = useElectronUpdater()
  return (
    <StatusPanel
      showProgress={electronUpdaterStatus.status === 'downloading'}
      percent={electronUpdaterStatus.downloadProgress?.percent || 0}
      label={electronUpdaterStatus.message || ''}
      error={electronUpdaterStatus.error?.message}
    />
  )
}

export function KernelUpdaterStatus() {
  const { status: kernelUpdaterStatus } = useKernelUpdater()
  return (
    <StatusPanel
      showProgress={kernelUpdaterStatus.status === 'downloading' || kernelUpdaterStatus.status === 'extracting'}
      percent={kernelUpdaterStatus.extractionProgress?.percent || kernelUpdaterStatus.downloadProgress?.percent || 0}
      label={kernelUpdaterStatus.message || ''}
      error={kernelUpdaterStatus.error?.message}
    />
  )
}

export function OllamaUpdaterStatus() {
  const { status: ollamaUpdaterStatus } = useOllamaUpdater()
  return (
    <StatusPanel
      showProgress={ollamaUpdaterStatus.status === 'downloading' || ollamaUpdaterStatus.status === 'extracting'}
      percent={
        ollamaUpdaterStatus.status === 'downloading'
          ? ollamaUpdaterStatus.downloadProgress?.percent || 0
          : ollamaUpdaterStatus.extractionProgress?.percent || 0
      }
      label={ollamaUpdaterStatus.message || ''}
      error={ollamaUpdaterStatus.error?.message}
    />
  )
}

export function HeartbeatStatus() {
  // const { t } = useTranslation()
  // const navigate = useNavigate()
  const { status: heartbeatStatus } = useHeartbeat()
  // const { status: pipelineUpdaterStatus } = usePipeline()
  // const isStartPending = !(
  //   pipelineUpdaterStatus.status === 'kernel-heartbeat' && heartbeatStatus.status === 'connected'
  // )
  // const handleStart = async () => {
  //   navigate(EnumRouterLink.ConversationNew)
  // }

  return (
    <>
      <StatusPanel showProgress={false} percent={0} label={heartbeatStatus.message} />
      {/* <div className="flex items-center gap-6 transition-opacity">
        <Button size="lg" disabled={isStartPending} onClick={handleStart}>
          {t('common.start')}
        </Button>
      </div> */}
    </>
  )
}

export function ModelUpdaterStatus() {
  const { status: modelUpdaterStatus } = useModelUpdater()
  const percent = modelUpdaterStatus.downloadProgress
    ? Math.min(100, (modelUpdaterStatus.downloadProgress.received / modelUpdaterStatus.downloadProgress.total) * 100)
    : 0
  return (
    <StatusPanel
      showProgress={modelUpdaterStatus.status === 'downloading'}
      percent={percent}
      label={modelUpdaterStatus.message || ''}
      error={modelUpdaterStatus.error?.message}
    />
  )
}

export function EmbedModelUpdaterStatus() {
  const { status: embedModelStatus } = useEmbedModelUpdater()
  const percent = embedModelStatus.downloadProgress
    ? Math.min(100, (embedModelStatus.downloadProgress.received / embedModelStatus.downloadProgress.total) * 100)
    : 0

  return (
    <StatusPanel
      showProgress={embedModelStatus.status === 'downloading'}
      percent={percent}
      label={embedModelStatus.message || ''}
      error={embedModelStatus.error?.message}
    />
  )
}

export function ModelDownloaderStatus() {
  const { data: maxWeightModel, triggerDownloadModel, triggerPauseDownloadModel } = useMaxWeightModelWithDownloader()

  return (
    <>
      {/* {kleeLlmModelsWithDownloader.map((model) => (
        <ModelDownloaderStatusItem
          key={model.id}
          model={model}
          triggerPauseDownloadModel={triggerPauseDownloadModel}
          triggerDownloadModel={triggerDownloadModel}
        />
      ))} */}
      {maxWeightModel && (
        <ModelDownloaderStatusItem
          model={maxWeightModel}
          triggerPauseDownloadModel={triggerPauseDownloadModel}
          triggerDownloadModel={triggerDownloadModel}
        />
      )}
    </>
  )
}

function ModelDownloaderStatusItem({
  model,
  triggerPauseDownloadModel,
  triggerDownloadModel,
}: {
  model: ILlmModelWithDownloader
  triggerPauseDownloadModel: (url: string) => void
  triggerDownloadModel: (url: string) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isDownloadFinished = model.stat?.data ? model.stat.data.stats.size >= model.store_size : false
  const percent = isDownloadFinished
    ? 100
    : model.downloadProgress
    ? (model.downloadProgress.received / model.downloadProgress.total) * 100
    : 0
  const handleBack = () => {
    navigate(EnumRouterLink.ModeSelection)
  }
  const handleSkip = () => {
    navigate(EnumRouterLink.DownloadingService + '?skipModelDownload=1')
  }
  return (
    <div key={model.id} className="flex w-full flex-col items-center justify-between gap-3">
      <StatusPanel key={model.id} showProgress={true} percent={percent} label={model.name} />
      <div className="flex w-full items-center justify-center gap-2">
        {/* Back */}
        {/* {model.downloadStatus !== 'downloading' && (
          <Button variant="link" onClick={handleBack}>
            {t('common.back')}
          </Button>
        )} */}
        <div>
          {/* Download button */}
          {model.downloadStatus === 'downloading' && (
            <Button onClick={() => triggerPauseDownloadModel(model.download_url)}>{t('common.pause')}</Button>
          )}
          {model.downloadStatus === 'paused' && (
            <Button onClick={() => triggerDownloadModel(model.download_url)}>{t('common.resume')}</Button>
          )}
          {model.downloadStatus === 'waiting' && (
            <Button onClick={() => triggerDownloadModel(model.download_url)}>{t('common.download')}</Button>
          )}
          {model.downloadStatus === 'completed' && <Button onClick={() => handleSkip()}>{t('common.continue')}</Button>}
        </div>
        {/* Skip */}
        {model.downloadStatus !== 'downloading' && (
          <Button variant="link" onClick={handleSkip}>
            {t('common.skip')}
          </Button>
        )}
        {/* {JSON.stringify(model)} */}
      </div>
    </div>
  )
}
