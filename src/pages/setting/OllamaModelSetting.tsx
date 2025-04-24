import { useTranslation } from 'react-i18next'
import { useOllamaSearchModels, useInvalidateOllamaModels } from '@/hooks/use-ollama'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { OllamaSearchModel } from '@/types'
// import { filesize } from 'filesize'
import { CloudDownload, Pause, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useIpcListener } from '@/hooks/use-ipc-listener'
import { toast } from 'sonner'
import { OllamaProgressResponse } from 'electron/types'

function PauseCircle({ percent, onClick }: { percent: number; onClick: () => void }) {
  return (
    <div className="relative inline-block h-4 w-4 cursor-pointer pt-1 text-primary" onClick={onClick}>
      <svg className="absolute left-0 top-1 h-4 w-4">
        <circle
          className="text-muted-foreground"
          strokeWidth="2"
          stroke="currentColor"
          fill="transparent"
          r="7"
          cx="8"
          cy="8"
          opacity="0.3"
        />
        <circle
          className="text-primary"
          strokeWidth="2"
          strokeDasharray={44}
          strokeDashoffset={44 - (44 * percent) / 100}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="7"
          cx="8"
          cy="8"
        />
      </svg>
      <div className="h-4 w-4 cursor-pointer p-0.5 text-primary">
        <Pause className="h-full w-full" />
      </div>
    </div>
  )
}

function ModelRow({ model }: { model: OllamaSearchModel }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progressResponse, setProgressResponse] = useState<OllamaProgressResponse | undefined>(undefined)
  const invalidateOllamaModels = useInvalidateOllamaModels()

  const handleModelDownload = async () => {
    try {
      console.log('Downloading model', model.model_name)
      window.ipcRenderer.invoke('ollama:pull', model.model_name)
      setIsDownloading(true)
    } catch (error) {
      console.error('Error downloading model:', error)
    }
  }

  const handleModelDelete = async () => {
    try {
      console.log('Deleting model', model.model_name)
      await window.ipcRenderer.invoke('ollama:delete', model.model_name)
      invalidateOllamaModels()
    } catch (error) {
      console.error('Error deleting model:', error)
    }
  }

  useIpcListener('ollama:pull-progress', (_, progressResponse: OllamaProgressResponse) => {
    if (progressResponse.name === model.model_name) {
      if (progressResponse.error) {
        if (!progressResponse.error.includes('aborted')) {
          toast.error(progressResponse.error)
        }
        setIsDownloading(false)
      } else {
        setProgressResponse(progressResponse)
        if (progressResponse.progress?.status === 'success') {
          setIsDownloading(false)
          invalidateOllamaModels()
        } else {
          setIsDownloading(true)
        }
      }
    }
  })

  const handleModelPause = async () => {
    try {
      console.log('Pausing model', model.model_name)
      await window.ipcRenderer.invoke('ollama:pause', model.model_name)
      setIsPaused(true)
      setIsDownloading(false)
    } catch (error) {
      console.error('Error pausing model:', error)
    }
  }

  const percent =
    typeof progressResponse?.progress?.completed === 'number'
      ? (progressResponse?.progress?.completed / progressResponse?.progress?.total) * 100
      : 0

  return (
    <TableRow>
      <TableCell>{model.model_name}</TableCell>
      <TableCell>{model.size}</TableCell>
      <TableCell>{model.recommend_ram}</TableCell>
      <TableCell>{model.provider}</TableCell>
      <TableCell className="w-28">
        {model.downloadCompleted ? (
          <Trash2 className="h-4 w-4 cursor-pointer" onClick={handleModelDelete} />
        ) : isDownloading ? (
          <div className="flex items-center gap-2">
            <PauseCircle percent={percent} onClick={handleModelPause} />
          </div>
        ) : (
          <CloudDownload className="h-4 w-4 cursor-pointer" onClick={handleModelDownload} />
        )}
      </TableCell>
      <TableCell className="flex w-44 flex-col items-center justify-center space-y-3 text-center text-xs">
        <div className="flex items-center justify-center">
          {model.downloadCompleted ? 'success' : `${progressResponse?.progress?.status || ''}`}
        </div>
        {percent !== 0 && <div className="text-center text-xs">{`(${percent.toFixed(2)}%)`}</div>}
      </TableCell>
    </TableRow>
  )
}

export default function OllamaModelSetting() {
  const { t } = useTranslation()
  const models = useOllamaSearchModels()

  return (
    <ScrollArea className="h-96">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('model')}</TableHead>
              <TableHead>{t('size')}</TableHead>
              <TableHead>{t('recommend_ram')}</TableHead>
              <TableHead>{t('provider')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
              <TableHead className="text-center">{t('progress')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models?.map((model) => (
              <ModelRow key={model.id} model={model} />
            ))}
          </TableBody>
        </Table>
      </Card>
    </ScrollArea>
  )
}
