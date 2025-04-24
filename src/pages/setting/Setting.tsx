import { DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Palette, Database, Server } from 'lucide-react'
import GeneralSetting from '@/pages/setting/GeneralSetting'
import ThemeSetting from '@/pages/setting/ThemeSetting'
// import { useTheme } from 'next-themes'
import CloudModelsSetting from '@/pages/setting/CloudModelsSetting'
import { useTranslation } from 'react-i18next'
import { SettingsTab } from '@/constants/settings'
import { useSettingTab } from '@/hooks/use-config'
import OllamaModelSetting from '@/pages/setting/OllamaModelSetting'
import supabase from '@/lib/supabase/client'

export default function Setting() {
  const { t } = useTranslation()
  // const { setTheme: setMode, resolvedTheme: mode } = useTheme()
  const [activeTab, setActiveTab] = useSettingTab()
  // const isDark = mode === 'dark'

  const settingsTabs = [
    { title: t('general'), value: SettingsTab.General, icon: Settings },
    { title: t('theme'), value: SettingsTab.Theme, icon: Palette },
    { title: t('local_models'), value: SettingsTab.LocalModels, icon: Database },
  ]
  if (import.meta.env.VITE_USE_CLOUD_MODE === 'true') {
    settingsTabs.push({ title: t('cloud_models'), value: SettingsTab.CloudModels, icon: Server })
  }

  return (
    <>
      <DialogTitle>{t('settings.title')}</DialogTitle>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
        <div className="flex items-center justify-between">
          <TabsList>
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.title}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {/* {activeTab === SettingsTab.Theme && (
            <CustomSwitch
              checked={isDark}
              onCheckedChange={(isDark) => setMode(isDark ? 'dark' : 'light')}
              leftIcon={<Moon className="w-4 h-4 fill-current text-primary-foreground" />}
              rightIcon={<Sun className="w-4 h-4 fill-current text-primary" />}
            />
          )} */}
        </div>
        <TabsContent value={SettingsTab.General}>
          <GeneralSetting />
        </TabsContent>
        <TabsContent value={SettingsTab.Theme}>
          <ThemeSetting />
        </TabsContent>
        <TabsContent value={SettingsTab.LocalModels}>
          {/* <LocalModelsSetting /> */}
          <OllamaModelSetting />
        </TabsContent>
        {supabase && (
          <TabsContent value={SettingsTab.CloudModels}>
            <CloudModelsSetting />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
