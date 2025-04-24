import LogoCard from '@/components/LogoCard'
import { Button } from '@/components/ui/button'
import { EnumRouterLink } from '@/constants/paths'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import {
  useLanguages,
  useDefaultLanguage,
  useSetDefaultLanguage,
  useModelLanguages,
  useDefaultModelLanguage,
  useSetModelLanguage,
} from '@/hooks/use-language'
import { useState } from 'react'
import { useConfig, useIsIntro } from '@/hooks/use-config'
import { useUser } from '@/lib/supabase/hooks'
import { Loader2 } from 'lucide-react'

export default function LanguageSelection() {
  const { t } = useTranslation()
  const languages = useLanguages()
  const defaultLanguage = useDefaultLanguage()
  const setDefaultLanguage = useSetDefaultLanguage()

  const modelLanguages = useModelLanguages()
  const defaultModelLanguage = useDefaultModelLanguage()
  const setModelLanguage = useSetModelLanguage()
  const [isConfirming, setIsConfirming] = useState(false)
  const [config, setConfig] = useConfig()
  const [isIntro, setIsIntro] = useIsIntro()
  const navigate = useNavigate()
  const user = useUser()

  const handleContinue = () => {
    navigate(EnumRouterLink.ModeSelection)
    // if (isIntro) {
    //   setIsConfirming(true)
    //   setConfig({ ...config, privateMode: false })
    //   return
    // }

    // navigate(EnumRouterLink.DownloadingService)
  }

  // useEffect(() => {
  //   if (!isConfirming) return

  //   const isCloudMode = !config.privateMode
  //   if (isCloudMode) {
  //     if (typeof user === 'undefined') return
  //     const canPass = !!user
  //     if (canPass) {
  //       navigate(EnumRouterLink.ModeSelection)
  //       // setIsIntro(false)
  //     }
  //   } else {
  //     // Cancel confirmation
  //     setIsConfirming(false)
  //   }
  // }, [config.privateMode, isConfirming, navigate, setConfig, setIsIntro, user])

  return (
    <div className="relative flex min-h-full w-full before:absolute before:inset-0 before:-z-10 before:bg-[url('/src/assets/images/onbording-bg.png')] before:bg-contain before:bg-bottom before:bg-no-repeat before:opacity-60">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-10 p-10">
        <LogoCard />
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>{t('onboarding.choseLanguage')}</CardTitle>
            <CardDescription>{t('onboarding.choseLanguageDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="system">{t('onboarding.system')}</Label>
                  <Select value={defaultLanguage?.id} onValueChange={setDefaultLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">{t('onboarding.reply')}</Label>
                  <Select value={defaultModelLanguage?.id || 'auto'} onValueChange={setModelLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {modelLanguages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Button size="lg" onClick={handleContinue} disabled={isConfirming}>
          {t('onboarding.continue')}
          {isConfirming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </div>
  )
}
