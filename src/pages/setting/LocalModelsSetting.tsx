import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Trash2, CloudDownload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Card } from '@/components/ui/card'
import { IDownloadProgress, ILlmModel, IModel } from '@/types'
import { filesize } from 'filesize'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useKleeLlmModels } from '@/hooks/use-klee-llm'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

function ModelRow({ model }: { model: IModel & ILlmModel }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [downloadProgress, setDownloadProgress] = useState<IDownloadProgress | null>(null)

  const handleModelDownload = (model: IModel) => {
    // console.log('[renderer] -> handleModelDownload', model)
    // const url = model.download_url
    // if (!url) return
    // const a = document.createElement('a')
    // a.href = url
    // a.download = model.name
    // a.click()

    window.ipcRenderer.invoke('downloader:resume', { url: model.download_url, length: model.store_size })
  }

  const handlePause = () => {
    window.ipcRenderer.invoke('downloader:pause', { url: model.download_url })
  }

  const handleResume = () => {
    window.ipcRenderer.invoke('downloader:resume', { url: model.download_url, length: model.store_size })
  }

  useEffect(() => {
    const listener = (event: Electron.IpcRendererEvent, data: IDownloadProgress) => {
      if (data.url !== model.download_url) return
      // Monitor download progress
      setDownloadProgress(data)
    }
    window.ipcRenderer.on('downloader::event::progress', listener)
    return () => {
      window.ipcRenderer.off('downloader::event::progress', listener)
    }
  }, [model])

  const handleDelete = () => {
    const filename = model.download_url.split('/').pop() || ''
    window.ipcRenderer.invoke('delete:file:llm', filename)
    queryClient.invalidateQueries({
      queryKey: ['models'],
    })
  }

  const downloadedSize = model.stat?.data?.stats.size || 0
  // Not downloaded
  const zeroDownloadedSize = downloadProgress ? false : downloadedSize === 0
  // Download not completed
  const unfinishedDownloadedSize = downloadProgress
    ? downloadProgress.state !== 'completed'
    : downloadedSize > 0 && downloadedSize < model.store_size
  // Download completed
  const finishedDownloadedSize = downloadProgress
    ? downloadProgress.state === 'completed'
    : downloadedSize >= model.store_size

  const showDownloadButton = zeroDownloadedSize
  const showPauseOrResumeButton = unfinishedDownloadedSize
  const showDeleteButton = finishedDownloadedSize
  const showProgress = unfinishedDownloadedSize
  const showProgressValue = unfinishedDownloadedSize

  return (
    <TableRow key={model.name} className="h-20">
      <TableCell>{model.name}</TableCell>
      <TableCell>{filesize(model.store_size)}</TableCell>
      <TableCell>{model.require}</TableCell>
      <TableCell>{model.brand}</TableCell>
      <TableCell className="w-28">
        {showDownloadButton && (
          <CloudDownload className="h-4 w-4 cursor-pointer" onClick={() => handleModelDownload(model)} />
        )}
        {showPauseOrResumeButton && (
          <Button
            className="h-6 w-auto"
            variant="outline"
            size="sm"
            onClick={downloadProgress?.state === 'progressing' ? handlePause : handleResume}
          >
            {downloadProgress?.state === 'progressing' ? t('pause') : t('resume')}
          </Button>
        )}
        {showDeleteButton && (
          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2 className="h-4 w-4 cursor-pointer text-destructive" />
              {/* {filesize(model.stat?.data?.stats.size || 0)} loaded */}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('continue_to_delete_this_model')}</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t('continue')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
      <TableCell className="w-40 space-y-3 text-center">
        {showProgress && (
          <>
            <Progress
              className="h-2"
              value={
                downloadProgress
                  ? (downloadProgress.received / downloadProgress.total) * 100
                  : (downloadedSize / model.store_size) * 100
              }
            />
            {showProgressValue && (
              <div className="text-sm text-muted-foreground">
                {filesize(downloadProgress ? downloadProgress.received : downloadedSize)}
              </div>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  )
}

export default function LocalModelsSetting() {
  const { t } = useTranslation()
  const { data: kleeModels } = useKleeLlmModels()

  return (
    <ScrollArea className="h-96">
      <Card className="mb-4 p-4 bg-blue-50 text-blue-900">
        <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer">
          {t('ollama.installNotice')}
        </a>
      </Card>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('model')}</TableHead>
              <TableHead>{t('size')}</TableHead>
              <TableHead>{t('recommend_ram')}</TableHead>
              <TableHead>{t('provider')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
              <TableHead>{t('progress')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kleeModels?.map((model) => (
              <ModelRow key={model.name} model={model as IModel & ILlmModel} />
            ))}
          </TableBody>
        </Table>
      </Card>
    </ScrollArea>
  )
}
