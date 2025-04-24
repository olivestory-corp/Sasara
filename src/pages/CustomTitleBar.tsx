import {
  LucidePanelRight,
  ShieldCheck,
  Cloudy,
  UserRoundCheck,
  Database,
  Lock,
  WifiOff,
  UserRoundX,
  Cpu,
  HardDrive,
  Cloud,
  LockOpen,
  Wifi,
  LeafyGreen,
  TreeDeciduous,
  Loader2,
} from 'lucide-react'
import { useOpenInspectorStatus, useOpenNoteInspectorStatus } from '@/hooks/useOpenStatus'
import { CustomSwitch } from '@/components/CustomSwitch'
import { useRouterField } from '@/hooks/use-router-field'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useConfig } from '@/hooks/use-config'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { usePlatform } from '@/hooks/use-electron'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnumRouterLink } from '@/constants/paths'
import { useNavigate } from 'react-router-dom'
import { syncFiles, syncLocalMode } from '@/services'

export default function CustomTitleBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useOpenInspectorStatus()
  const [isOpenNote, setIsOpenNote] = useOpenNoteInspectorStatus()
  // const { local_mode } = useConversationSettings()
  const [config, setConfig] = useConfig()
  const local_mode = config.privateMode ?? true
  const setLocalMode = (mode: boolean) => {
    setConfig({ ...config, privateMode: mode })
  }
  // const { reset } = useConversationSettings()
  const routerField = useRouterField()
  const [showAlert, setShowAlert] = useState(false)
  const [pendingMode, setPendingMode] = useState(false)
  const platform = usePlatform()
  // const isEmptyModelWithDownloader = useIsEmptyModelWithDownloader()
  const [showDetail, setShowDetail] = useState(false)

  const toggleShowDetail = () => {
    setShowDetail(!showDetail)
  }

  const selectModeData = {
    local: {
      title: { text: t('onboarding.localMode'), icon: <ShieldCheck /> },
      description: t('onboarding.localModeDescription'),
      features: [
        { text: t('onboarding.openSourceModels'), icon: <Database className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.fullDataSecurityAndPrivacy'), icon: <Lock className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.offlineUsage'), icon: <WifiOff className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.noLoginAndSubscription'), icon: <UserRoundX className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.highPerformanceGPU'), icon: <Cpu className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.diskSpace'), icon: <HardDrive className="h-4 w-4 text-primary" /> },
      ],
    },
    cloud: {
      title: { text: t('onboarding.cloudMode'), icon: <Cloudy /> },
      description: t('onboarding.cloudModeDescription'),
      features: [
        { text: t('onboarding.advancedModels'), icon: <Cloud className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.dataSentToCloud'), icon: <LockOpen className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.internetConnectionRequired'), icon: <Wifi className="h-4 w-4 text-primary" /> },
        {
          text: t('onboarding.loginAndSubscriptionRequired'),
          icon: <UserRoundCheck className="h-4 w-4 text-primary" />,
        },
        { text: t('onboarding.noNeedForGPU'), icon: <LeafyGreen className="h-4 w-4 text-primary" /> },
        { text: t('onboarding.noNeedToDownloadModels'), icon: <TreeDeciduous className="h-4 w-4 text-primary" /> },
      ],
    },
  }

  const handleModeChange = (newMode: boolean) => {
    setPendingMode(newMode)
    setShowAlert(true)
  }

  const handleConfirm = async () => {
    try {
      await syncLocalMode(pendingMode)
      setLocalMode(pendingMode)
      setShowAlert(false)
      // If switching to local mode and no models exist, redirect to the guide page
      // if (pendingMode) {
      //   const ollamaStatus: 0 | 1 | 2 | 3 = await window.ipcRenderer.invoke('ollama:get-status')
      //   if (ollamaStatus !== 3) {
      //     navigate(EnumRouterLink.DownloadingService)
      //   }
      // }
      // reload when local mode is changed
      // setTimeout(() => {
      //   window.location.reload()
      // }, 60)
      navigate(EnumRouterLink.DownloadingService)
    } catch (error) {
      console.error(error)
    }
  }

  const handleClose = () => {
    setShowAlert(false)
    setTimeout(() => {
      setShowDetail(false)
    }, 600)
  }

  // const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
  //   queryKey: ['syncStatus'],
  //   queryFn: () => getSyncFilesStatus(),
  // })
  const [isSyncing, setIsSyncing] = useState(false)
  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await syncFiles()
      console.log(res)
      // await refetchSyncStatus()
      setIsSyncing(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <>
      <header
        className={cn(
          'relative z-20 flex h-11 w-full flex-none items-end justify-between bg-titlebar-background [-webkit-app-region:drag]',
          platform === 'darwin' ? 'pl-20' : 'pl-4',
        )}
      >
        <div className="flex h-full items-center gap-4">
          {!routerField.onboarding && (
            <SidebarTrigger className="h-5 w-5 text-titlebar-foreground [-webkit-app-region:no-drag] hover:bg-transparent hover:text-titlebar-foreground-selected" />
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-4 py-2 pl-4 [-webkit-app-region:no-drag]',
            platform === 'darwin' ? 'pr-4' : 'pr-36',
          )}
        >
          {/* sync btn */}
          {!local_mode && !routerField.onboarding && (
            <Button variant={'ghost'} size="icon" className="h-5 w-auto px-2" onClick={handleSync}>
              {t('titleBar.sync')}
              {isSyncing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          )}
          {routerField.note && (
            <>
              <LucidePanelRight
                className="h-5 w-5 cursor-pointer text-titlebar-foreground hover:bg-transparent hover:text-titlebar-foreground-selected"
                onClick={() => setIsOpenNote(!isOpenNote)}
              />
              {/* <Badge>Dev</Badge> */}
            </>
          )}
          {(routerField.conversationDetail || routerField.conversation) && (
            <LucidePanelRight
              className="h-5 w-5 cursor-pointer text-titlebar-foreground hover:bg-transparent hover:text-titlebar-foreground-selected"
              onClick={() => setIsOpen(!isOpen)}
            />
          )}
          {!routerField.onboarding && import.meta.env.VITE_USE_CLOUD_MODE === 'true' && (
            <CustomSwitch
              checked={local_mode}
              onCheckedChange={handleModeChange}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
              rightIcon={<Cloudy className="h-4 w-4 fill-current" />}
            />
          )}
        </div>
      </header>

      <AlertDialog open={showAlert} onOpenChange={handleClose}>
        <AlertDialogContent className="max-w-fit">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingMode ? t('titleBar.switchToLocalMode') : t('titleBar.switchToCloudMode')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMode ? t('titleBar.localModeDescription') : t('titleBar.cloudModeDescription')}
              {/* {pendingMode && isEmptyModelWithDownloader && <div>{t('titleBar.noModel')}</div>} */}
              {showDetail && (
                <div className="mt-4 flex w-full gap-6">
                  {Object.entries(selectModeData).map(([mode, data]) => (
                    <Card
                      key={mode}
                      // onClick={() => setSelectedMode(mode as 'local' | 'cloud')}
                      className={cn(
                        'w-96 flex-1 transition-all duration-300',
                        // selectedMode === mode ? 'border-primary bg-muted' : '',
                      )}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-xl text-primary">
                          <div className="flex items-center gap-2">
                            {data.title.text}
                            {data.title.icon}
                          </div>
                          {/* {selectedMode === mode && <Badge>{t('onboarding.selected')}</Badge>} */}
                        </CardTitle>
                        <CardDescription className="text-sm">{data.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {feature.icon}
                              {feature.text}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={toggleShowDetail}>
              {t('common.detail')}
            </Button>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
