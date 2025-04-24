import LogoCard from '@/components/LogoCard'
import { Button } from '@/components/ui/button'
import { EnumRouterLink } from '@/constants/paths'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Database,
  Lock,
  Cpu,
  HardDrive,
  Cloud,
  LeafyGreen,
  LockOpen,
  WifiOff,
  Wifi,
  UserRoundX,
  UserRoundCheck,
  TreeDeciduous,
  ShieldCheck,
  Cloudy,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useConfig, useIsIntro } from '@/hooks/use-config'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { useUser } from '@/lib/supabase/hooks'
import { useSubscription } from '@/hooks/use-subscription'

export default function ModeSelection() {
  const { t } = useTranslation()
  const [config, setConfig] = useConfig()
  const [, setIsIntro] = useIsIntro()
  const [selectedMode, setSelectedMode] = useState<'local' | 'cloud'>(config.privateMode ? 'local' : 'cloud')
  const navigate = useNavigate()
  const [isConfirming, setIsConfirming] = useState(false)
  const user = useUser()
  const { data: subscription } = useSubscription()

  interface SelectModeData {
    local: {
      title: { text: string; icon: JSX.Element }
      description: string
      features: { text: string; icon: JSX.Element }[]
    }
    cloud: {
      title: { text: string; icon: JSX.Element }
      description: string
      features: { text: string; icon: JSX.Element }[]
    } | null
  }
  const selectModeData: SelectModeData = {
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
    cloud: null,
  }
  if (import.meta.env.VITE_USE_CLOUD_MODE === 'true') {
    selectModeData.cloud = {
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
    }
  }

  useEffect(() => {
    if (!isConfirming) return

    // If the current mode is cloud, then the user and subscription verification is required
    if (!config.privateMode) {
      if (typeof user === 'undefined') return

      const canPass = !!user
      if (canPass) {
        navigate(EnumRouterLink.DownloadingService)
        setIsIntro(false)
      }
    } else {
      setIsConfirming(false)
      setSelectedMode('local')
    }
  }, [config, isConfirming, navigate, setConfig, setIsIntro, subscription, user])

  const handleContinue = () => {
    const privateMode = selectedMode === 'local'
    setConfig({ ...config, privateMode })
    if (!privateMode) {
      setIsConfirming(true)
    } else {
      navigate(EnumRouterLink.DownloadingService)
      setIsIntro(false)
    }
    // setIsIntro(false)
  }

  const handlePrevious = () => {
    navigate(EnumRouterLink.LanguageSelection)
  }

  return (
    <div className="relative flex min-h-full w-full before:absolute before:inset-0 before:-z-10 before:bg-[url('/src/assets/images/onbording-bg.png')] before:bg-contain before:bg-bottom before:bg-no-repeat before:opacity-60">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-10 p-10">
        <LogoCard />
        <div className="flex w-full gap-6">
          {Object.entries(selectModeData).map(([mode, data]: [string, SelectModeData[keyof SelectModeData]]) =>
            data ? (
              <Card
                key={mode}
                onClick={() => setSelectedMode(mode as 'local' | 'cloud')}
                className={cn(
                  'w-96 flex-1 cursor-pointer transition-all duration-300',
                  selectedMode === mode ? 'border-primary bg-muted' : '',
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-2xl text-primary">
                    <div className="flex items-center gap-2">
                      {data.title.text}
                      {data.title.icon}
                    </div>
                    {selectedMode === mode && <Badge>{t('onboarding.selected')}</Badge>}
                  </CardTitle>
                  <CardDescription className="text-base">{data.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-base">
                        {feature.icon}
                        {feature.text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null,
          )}
        </div>
        <span className="flex items-center text-sm text-muted-foreground">{t('onboarding.recommend')}</span>
        <div className="flex items-center gap-6">
          <Button variant="link" onClick={handlePrevious} disabled={isConfirming}>
            {t('onboarding.previous')}
          </Button>
          <Button size="lg" onClick={handleContinue} disabled={isConfirming}>
            {t('onboarding.continue')}
            {isConfirming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
