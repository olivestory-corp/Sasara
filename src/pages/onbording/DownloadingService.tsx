import LogoCard from '@/components/LogoCard'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
// import { useSearchParams } from 'react-router-dom'
import {
  HeartbeatStatus,
  ElectronUpdaterStatus,
  KernelUpdaterStatus,
  // ModelDownloaderStatus,
  EmbedModelUpdaterStatus,
  OllamaUpdaterStatus,
} from './_components/status'
import {
  useHeartbeat,
  useElectronUpdater,
  usePipeline,
  useKernelUpdater,
  useEmbedModelUpdater,
  useOllamaUpdater,
} from '@/hooks/use-updater'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EnumRouterLink } from '@/constants/paths'

function DownloadingServiceStatus() {
  const navigate = useNavigate()
  // const { t } = useTranslation()
  const { status: pipelineUpdaterStatus } = usePipeline()
  const { status: electronUpdaterStatus, trigger: triggerDownloadElectron } = useElectronUpdater()
  const { status: kernelUpdaterStatus, trigger: triggerDownloadKernel } = useKernelUpdater()
  // const { status: modelUpdaterStatus, trigger: triggerDownloadModel } = useModelUpdater()
  const { status: heartbeatStatus, trigger: triggerFetchHeartbeat } = useHeartbeat()
  const { status: embedModelUpdaterStatus, trigger: triggerDownloadEmbedModel } = useEmbedModelUpdater()
  const { status: ollamaUpdaterStatus, trigger: triggerFetchOllamaUpdaterStatus } = useOllamaUpdater()

  // Automatic execution
  useEffect(() => {
    console.log('[renderer] ========= START =========')
    console.log('[renderer] pipeline updater status', pipelineUpdaterStatus)
    console.log('[renderer] electron updater status', electronUpdaterStatus)
    console.log('[renderer] embed model updater status', embedModelUpdaterStatus)
    console.log('[renderer] ollama updater status', ollamaUpdaterStatus)
    console.log('[renderer] kernel updater status', kernelUpdaterStatus)
    console.log('[renderer] heartbeat status', heartbeatStatus)
    console.log('[renderer] ========= END =========')

    switch (pipelineUpdaterStatus.status) {
      case 'electron-update':
        if (electronUpdaterStatus.status === 'waiting-download') {
          triggerDownloadElectron()
        }
        break
      case 'ollama-update':
        if (ollamaUpdaterStatus.status === 'waiting-check') {
          triggerFetchOllamaUpdaterStatus()
        }
        break
      case 'kernel-update':
        if (kernelUpdaterStatus.status === 'waiting-check') {
          triggerDownloadKernel()
        }
        break
      // case 'model-update':
      //   // triggerDownloadModel()
      //   break
      case 'kernel-heartbeat':
        if (heartbeatStatus.status === 'waiting') {
          triggerFetchHeartbeat()
        } else if (heartbeatStatus.status === 'connected') {
          navigate(EnumRouterLink.ConversationNew)
        }
        break
      case 'embed-model-update':
        if (embedModelUpdaterStatus.status === 'waiting-check') {
          triggerDownloadEmbedModel()
        }
        break
      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pipelineUpdaterStatus.status,
    electronUpdaterStatus.status,
    embedModelUpdaterStatus.status,
    kernelUpdaterStatus.status,
    heartbeatStatus.status,
  ])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-10 overflow-hidden break-all py-4 ">
      {/* Electron client hot update */}
      {pipelineUpdaterStatus.status === 'electron-update' && <ElectronUpdaterStatus />}
      {/* Embedding model download */}
      {pipelineUpdaterStatus.status === 'embed-model-update' && <EmbedModelUpdaterStatus />}
      {/* Ollama download */}
      {pipelineUpdaterStatus.status === 'ollama-update' && <OllamaUpdaterStatus />}
      {/* Python server hot update */}
      {pipelineUpdaterStatus.status === 'kernel-update' && <KernelUpdaterStatus />}
      {/* Model download */}
      {/* {pipelineUpdaterStatus.status === 'model-update' && <ModelDownloaderStatus />} */}
      {/* Heartbeat detection */}
      {pipelineUpdaterStatus.status === 'kernel-heartbeat' && <HeartbeatStatus />}

      {/* <ElectronUpdaterStatus /> */}
      {/* <KernelUpdaterStatus /> */}
      {/* <ModelUpdaterStatus /> */}
      {/* <ModelDownloaderStatus /> */}
      {/* <HeartbeatStatus /> */}

      {/* Start button */}
      {/* <div className="flex items-center gap-6 transition-opacity">
        <Button size="lg" disabled={isStartPending} onClick={handleStart}>
          {t('common.start')}
        </Button>
      </div> */}
    </div>
  )
}

export default function DownloadingService() {
  const { t } = useTranslation()
  const downloadingServiceData = [
    {
      title: t('onboarding.aiNotes'),
      description: t('onboarding.aiNotesDescription'),
    },
    {
      title: t('onboarding.knowledgeBase'),
      description: t('onboarding.knowledgeBaseDescription'),
    },
    {
      title: t('onboarding.scalability'),
      description: t('onboarding.scalabilityDescription'),
    },
    {
      title: t('onboarding.autoComplete'),
      description: t('onboarding.autoCompleteDescription'),
    },
    {
      title: t('onboarding.intelligence'),
      description: t('onboarding.intelligenceDescription'),
    },
    {
      title: t('onboarding.privacy'),
      description: t('onboarding.privacyDescription'),
    },
  ]

  // Test version to output version number
  // const { data: appVersion } = useQuery({
  //   queryKey: ['app-version'],
  //   queryFn: () => window.ipcRenderer.invoke('get-app-version'),
  // })
  // useEffect(() => {
  //   if (appVersion) {
  //     alert('Current version: ' + appVersion)
  //   }
  // }, [appVersion])

  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-start before:absolute before:inset-0 before:-z-10 before:bg-[url('/src/assets/images/onbording-bg.png')] before:bg-contain before:bg-bottom before:bg-no-repeat before:opacity-60">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-10 pb-10 pt-44">
        <LogoCard />
        <Carousel className="w-full">
          <CarouselContent>
            {downloadingServiceData.map((item, index) => (
              <CarouselItem key={index}>
                <Card className="m-1">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <DownloadingServiceStatus />
    </div>
  )
}
