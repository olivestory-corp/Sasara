import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Discord from '@/assets/social-media/discord.png'
import X from '@/assets/social-media/x.png'
import Ins from '@/assets/social-media/ins.png'
import { PackageCheck, Users, Laptop, MessageSquare, Languages } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useLanguages,
  useDefaultLanguage,
  useSetDefaultLanguage,
  useModelLanguages,
  useDefaultModelLanguage,
  useSetModelLanguage,
} from '@/hooks/use-language'

const generalSettingsData = {
  developer: {
    name: 'Olivestory Corp.',
    url: 'https://sasaradesktop.com',
  },
  website: {
    name: 'sasaradesktop.com',
    url: 'https://sasaradesktop.com',
  },
  socialLinks: [
    { icon: Discord, alt: 'Discord', url: 'https://sasaradesktop.com' },
    { icon: X, alt: 'X', url: 'https://sasaradesktop.com' },
    { icon: Ins, alt: 'Instagram', url: 'https://sasaradesktop.com' },
  ],
}

export default function GeneralSetting() {
  const { t } = useTranslation()
  const languages = useLanguages()
  const defaultLanguage = useDefaultLanguage()
  const setDefaultLanguage = useSetDefaultLanguage()

  // Model language
  const modelLanguages = useModelLanguages()
  const defaultModelLanguage = useDefaultModelLanguage()
  const setModelLanguage = useSetModelLanguage()

  const { data: appVersion } = useQuery({
    queryKey: ['appVersion'],
    queryFn: () => window.ipcRenderer.invoke('get-app-version'),
  })

  const handleUpdate = async () => {
    const info = await window.ipcRenderer.invoke('check-for-updates')
    console.log(info)
  }

  return (
    <ScrollArea className="h-96">
      <Card className="space-y-2 px-4 py-2">
        {/* Version */}
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4" />
            <Label htmlFor="version">
              {t('version')} {appVersion}
            </Label>
          </div>
          {/* <Button variant="ghost" onClick={handleUpdate}>
            {t('update')}
          </Button> */}
        </div>
        {/* System Language */}
        <Separator />
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <Label htmlFor="language">{t('settings.systemLanguage')}</Label>
          </div>
          <Select value={defaultLanguage?.id} onValueChange={setDefaultLanguage}>
            <SelectTrigger className="w-[120px]">
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
        {/* <Separator /> */}
        {/* Font Size */}
        {/* <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-2">
            <ALargeSmall className="w-4 h-4" />
            <Label htmlFor="font">Font Size</Label>
          </div>
          <Slider defaultValue={[2]} max={4} step={1} className="w-[120px]" />
        </div> */}
        <Separator />
        {/* Developer */}
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Label htmlFor="signerlabs">{t('developed_by')}</Label>
          </div>
          <a href={generalSettingsData.developer.url} target="_blank" rel="noopener noreferrer">
            <Button variant="link">{generalSettingsData.developer.name}</Button>
          </a>
        </div>
        <Separator />
        {/* Official Website */}
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <Label htmlFor="kleedesktop">{t('official_website')}</Label>
          </div>
          <a href={generalSettingsData.website.url} target="_blank" rel="noopener noreferrer">
            <Button variant="link">{generalSettingsData.website.name}</Button>
          </a>
        </div>
        <Separator />
        {/* Contact Us */}
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <Label htmlFor="signerlabs">{t('contact_us')}</Label>
          </div>
          <div className="flex items-center gap-4">
            {generalSettingsData.socialLinks.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                <img src={link.icon} alt={link.alt} className="h-6 rounded-md bg-white p-1" />
              </a>
            ))}
          </div>
        </div>
      </Card>
    </ScrollArea>
  )
}
