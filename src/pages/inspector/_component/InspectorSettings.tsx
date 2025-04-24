import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConversationSettingsById } from '@/hooks/use-conversation'
import { IModel, IModelLanguage, ILlmProvider, IBaseOption } from '@/types'
import { useRefetchLocalLlmModelById } from '@/hooks/use-llm'
import { useCurrentConversationByNote } from '@/hooks/use-note'
import { Button } from '@/components/ui/button'
import { MoveRight, LucideDownloadCloud, LucidePause, LucidePlayCircle, CheckCircle } from 'lucide-react'
import { useMemo, useCallback } from 'react'
import { useModelUpdaterWithDownloader } from '@/hooks/use-updater'

export default function InspectorSettings() {
  const currentConversation = useCurrentConversationByNote()
  const {
    allProviders,
    selectedProvider,
    selectedModel,
    languages,
    selectedLanguageId,
    setSelectedLanguageId,
    setSelectedModelId,
    setSelectedProviderId,
    local_mode,
  } = useConversationSettingsById({ id: currentConversation?.id })

  const refetchLocalLlmModel = useRefetchLocalLlmModelById({ id: currentConversation?.id || '' })

  const {
    data: modelUpdaterWithDownloader,
    triggerDownloadModel,
    triggerPauseDownloadModel,
  } = useModelUpdaterWithDownloader()
  const modelUpdaterWithDownloaderMap = useMemo(() => {
    return new Map(modelUpdaterWithDownloader?.map((model) => [model.id, model]))
  }, [modelUpdaterWithDownloader])

  const renderSuffixComponent = useCallback(
    (option: IBaseOption) => {
      // return null
      const modelUpdaterWithDownloader = modelUpdaterWithDownloaderMap.get(option.id)

      if (!modelUpdaterWithDownloader) return null

      const downloadStatus = modelUpdaterWithDownloader.downloadStatus
      const percent = modelUpdaterWithDownloader.downloadProgress
        ? (modelUpdaterWithDownloader.downloadProgress.received / modelUpdaterWithDownloader.downloadProgress.total) *
          100
        : 0

      return (
        <div className="pointer-events-auto pl-1 pr-3">
          {downloadStatus === 'waiting' && (
            <LucideDownloadCloud
              onClick={() => triggerDownloadModel(modelUpdaterWithDownloader.download_url)}
              className="inline-block h-4 w-4 cursor-pointer text-primary"
            />
          )}
          {downloadStatus === 'downloading' && (
            <div
              className="relative inline-block h-4 w-4 cursor-pointer pt-1 text-primary"
              onClick={() => triggerPauseDownloadModel(modelUpdaterWithDownloader.download_url)}
            >
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
                <LucidePause className="h-full w-full" />
              </div>
            </div>
          )}
          {downloadStatus === 'paused' && (
            <LucidePlayCircle
              onClick={() => triggerDownloadModel(modelUpdaterWithDownloader.download_url)}
              className="inline-block h-4 w-4 cursor-pointer text-primary"
            />
          )}
          {downloadStatus === 'completed' && <CheckCircle className="inline-block h-4 w-4" />}
          {/* <span>{modelUpdaterWithDownloader.id}</span> */}
        </div>
      )
    },
    [modelUpdaterWithDownloaderMap],
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Provider selection */}
      {!local_mode && (
        <Select
          value={selectedProvider?.id}
          onValueChange={(value) => setSelectedProviderId(value as ILlmProvider['id'])}
        >
          <SelectTrigger className="h-6 w-auto gap-1 border-none bg-transparent p-1 text-xs focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allProviders?.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {/* Model selection */}
      {selectedProvider?.id !== 'local' && (
        <Select value={selectedModel?.id} onValueChange={(value) => setSelectedModelId(value as IModel['id'])}>
          <SelectTrigger className="h-6 w-auto gap-1 border-none bg-transparent p-1 text-xs focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {selectedProvider?.models.map((model) => (
                <div key={model.id} className="flex items-center justify-between">
                  <SelectItem key={model.id} value={model.id} disabled={model.disabled} className="flex">
                    {model.name}
                  </SelectItem>
                  {selectedProvider.id === 'klee' && renderSuffixComponent(model)}
                </div>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {selectedProvider?.id === 'local' && (
        <Select value={selectedModel?.path || 'NULL'}>
          <SelectTrigger className="h-6 w-auto gap-1 border-none bg-transparent p-1 text-xs focus:ring-0 focus:ring-offset-0">
            <span>{selectedModel?.path ? `... ${selectedModel.path.slice(-8)}` : ''}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={selectedModel?.path || 'NULL'}>
                <span>{selectedModel?.path}</span>
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <div className="flex items-center justify-start text-sm">
                <Button variant="ghost" className="w-auto px-3" size="sm" onClick={refetchLocalLlmModel}>
                  <MoveRight className="pointer-events-auto ml-2 inline-block h-4 w-4 cursor-pointer" />
                </Button>
              </div>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {/* Reply Language selection */}
      <Select
        value={selectedLanguageId}
        onValueChange={(value) => setSelectedLanguageId(value as IModelLanguage['id'])}
      >
        <SelectTrigger className="h-6 w-auto gap-1 border-none bg-transparent p-1 text-xs focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {languages?.map((language) => (
              <SelectItem key={language.id} value={language.id}>
                {language.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
