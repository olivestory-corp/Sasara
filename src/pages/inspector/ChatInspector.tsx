import { useOpenInspectorStatus } from '@/hooks/useOpenStatus'
import { useCallback, useEffect, useMemo } from 'react'
import { Label } from '../../components/ui/label'
import { AccordionContent, AccordionItem, AccordionTrigger, Accordion } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Database,
  LucideNotebookPen,
  LibraryBig,
  ShieldCheck,
  Cloudy,
  RefreshCw,
  LucideDownloadCloud,
  CheckCircle,
  LucidePlayCircle,
  LucidePause,
  Plus,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { ListSelector } from '@/components/ListSelector'
import { ListSwitcher } from '@/components/ListSwitcher'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useConversationDetail, useConversationSettings } from '@/hooks/use-conversation'
import { IBaseCheckOption, IBaseOption } from '@/types'
import { useParams } from 'react-router-dom'
import { useOllamaLlmModels } from '@/hooks/use-ollama'
import { useRefetchLocalLlmModel } from '@/hooks/use-llm'
import { Button } from '@/components/ui/button'
import { ListChooser } from '@/components/ListChooser'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useModelUpdaterWithDownloader } from '@/hooks/use-updater'
import { useSettingTab, useIsSettingOpen } from '@/hooks/use-config'
import { SettingsTab } from '@/constants/settings'
import { useKnowledgeItems } from '@/hooks/use-knowledge'
import { useNotes } from '@/hooks/use-note'

function ModeSetting() {
  const { t } = useTranslation()
  const { local_mode } = useConversationSettings()
  const inspectorDummyData = {
    privacyMode: {
      on: {
        title: t('inspector.localMode'),
        description: t('inspector.localModeDescription'),
      },
      off: {
        title: t('inspector.cloudMode'),
        description: t('inspector.cloudModeDescription'),
      },
    },
  }

  return (
    <Card className={cn(local_mode ? 'border-primary/20 bg-primary/5' : 'border-muted')}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {local_mode ? inspectorDummyData.privacyMode.on.title : inspectorDummyData.privacyMode.off.title}
          {local_mode ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Cloudy className="h-4 w-4 text-primary" />}
        </CardTitle>
        <CardDescription>
          {local_mode ? inspectorDummyData.privacyMode.on.description : inspectorDummyData.privacyMode.off.description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function ModelSetting() {
  const { t } = useTranslation()
  const { conversationId = '' } = useParams()
  const {
    selectedProvider,
    setSelectedModelId,
    allProviders,
    selectedLanguageId,
    setSelectedLanguageId,
    languages,
    setSelectedProviderId,
    system_prompt,
    setSystemPrompt,
    selectedModel,
    local_mode,
  } = useConversationSettings()
  const { refetch: refetchOllamaModels } = useOllamaLlmModels()
  const refetchLocalLlmModel = useRefetchLocalLlmModel()

  const {
    data: modelUpdaterWithDownloader,
    triggerDownloadModel,
    triggerPauseDownloadModel,
  } = useModelUpdaterWithDownloader()
  const modelUpdaterWithDownloaderMap = useMemo(() => {
    return new Map(modelUpdaterWithDownloader?.map((model) => [model.id, model]))
  }, [modelUpdaterWithDownloader])

  const [, setActiveTab] = useSettingTab()
  const [, setIsSettingOpen] = useIsSettingOpen()

  useEffect(() => {
    if (local_mode) {
      refetchOllamaModels()
    }
  }, [local_mode, refetchOllamaModels])

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

  const handleAddMore = () => {
    setActiveTab(SettingsTab.LocalModels)
    setIsSettingOpen(true)
  }

  const renderOllamaSuffixComponent = () => {
    return (
      <Button className="h-6 w-full text-sm text-muted-foreground" variant="ghost" size="sm" onClick={handleAddMore}>
        <Plus className="mr-1 h-4 w-4" /> <span>{t('inspector.addMore')}</span>
      </Button>
    )
  }

  const renderAdditional = local_mode
    ? selectedProvider?.id === 'ollama'
      ? renderOllamaSuffixComponent
      : undefined
    : undefined

  const renderSuffix = local_mode ? (selectedProvider?.id === 'klee' ? renderSuffixComponent : undefined) : undefined

  return (
    <Accordion type="multiple" defaultValue={['model-setting']} className="text-foreground">
      <AccordionItem value="model-setting">
        <AccordionTrigger>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="text-base font-medium" asChild>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>{t('inspector.model')}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t('inspector.modelDescription')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-6 p-2">
            <ListSelector
              label={t('inspector.provider')}
              options={allProviders}
              value={selectedProvider?.id || ''}
              onValueChange={setSelectedProviderId}
              className={cn(local_mode && selectedProvider?.id === 'ollama' && 'hidden')}
            />
            {selectedProvider?.id !== 'local' && (
              <>
                <ListSelector
                  label={
                    <div className="flex items-center gap-2">
                      <span>{t('inspector.model')}</span>
                      {local_mode && selectedProvider?.id === 'ollama' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => refetchOllamaModels()}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  }
                  options={
                    local_mode && selectedProvider?.id === 'klee'
                      ? modelUpdaterWithDownloader
                      : selectedProvider?.models || []
                  }
                  value={selectedModel?.id}
                  onValueChange={setSelectedModelId}
                  renderSuffixComponent={renderSuffix}
                  renderAdditionalComponent={renderAdditional}
                />
              </>
            )}
            {local_mode && selectedProvider?.id === 'local' && (
              <ListChooser label={t('inspector.path')} value={selectedModel?.path} onChoose={refetchLocalLlmModel} />
            )}
            {/* <ListSelector
              label={t('inspector.replyLanguage')}
              options={languages}
              value={selectedLanguageId}
              onValueChange={(value) => setSelectedLanguageId(value as IModelLanguage['id'])}
            /> */}
            <div className="flex flex-col gap-4">
              <Label htmlFor="prompt">{t('inspector.systemPrompt')}</Label>
              <Textarea
                key={conversationId}
                placeholder={t('inspector.systemPromptPlaceholder')}
                defaultValue={system_prompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="focus-visible:ring-0"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function KnowledgeSetting() {
  const { t } = useTranslation()
  const { setKnowledgeIds } = useConversationSettings()
  const [isOpen] = useOpenInspectorStatus()
  const { data: knowledgeItems } = useKnowledgeItems()
  const { data: conversationDetail } = useConversationDetail()
  const knowledge_ids = useMemo(() => conversationDetail?.conversation.knowledge_ids || [], [conversationDetail])

  const knowledgeItemOptions: IBaseCheckOption[] = useMemo(() => {
    return (
      knowledgeItems?.map((knowledge) => ({
        id: knowledge.id,
        name: knowledge.title || t('sidebar.newKnowledge'),
        description: knowledge.description || t('sidebar.newKnowledgeDescription'),
        checked: knowledge_ids.includes(knowledge.id),
      })) || []
    )
  }, [knowledgeItems, knowledge_ids, t])

  const onChange = (items: IBaseCheckOption[]) => {
    setKnowledgeIds(items.filter((item) => item.checked).map((item) => item.id))
  }

  return (
    <Accordion type="multiple" defaultValue={['knowledge-setting']} className="text-foreground">
      <AccordionItem value="knowledge-setting">
        <AccordionTrigger>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="text-base font-medium" asChild>
                <div className="flex items-center gap-2">
                  <LibraryBig className="h-4 w-4" />
                  <span>{t('inspector.knowledgeBase')}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t('inspector.knowledgeBaseDescription')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-6 p-2">
            <ListSwitcher items={knowledgeItemOptions} onChange={onChange} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function NoteSetting() {
  const { t } = useTranslation()
  const [isOpen] = useOpenInspectorStatus()
  const { data: conversationDetail } = useConversationDetail()
  const note_ids = useMemo(() => conversationDetail?.conversation.note_ids || [], [conversationDetail])
  const { data: notes } = useNotes()
  const { setNoteIds } = useConversationSettings()
  const noteOptions: IBaseCheckOption[] = useMemo(() => {
    return (
      notes?.map((note) => ({
        id: note.id,
        name: note.title || t('sidebar.newNote'),
        description: note.content || t('sidebar.newNoteDescription'),
        checked: note_ids.includes(note.id),
      })) || []
    )
  }, [notes, note_ids, t])

  const onChange = (items: IBaseCheckOption[]) => {
    setNoteIds(items.filter((item) => item.checked).map((item) => item.id))
  }
  return (
    <Accordion type="multiple" defaultValue={['note-setting']} className="text-foreground">
      <AccordionItem value="note-setting">
        <AccordionTrigger>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="text-base font-medium" asChild>
                <div className="flex items-center gap-2">
                  <LucideNotebookPen className="h-4 w-4" />
                  <span>{t('inspector.note')}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t('inspector.noteDescription')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-6 p-2">
            <ListSwitcher items={noteOptions} onChange={onChange} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default function ChatInspector() {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col space-y-4 overflow-y-auto p-4">
        <ModelSetting />
        <KnowledgeSetting />
        <NoteSetting />
        <ModeSetting />
      </div>
    </ScrollArea>
  )
}
