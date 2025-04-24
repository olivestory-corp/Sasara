import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import supabase from '@/lib/supabase'
import { Settings } from 'lucide-react'
import { useUser } from '@/lib/supabase/hooks'
import { useNavigate } from 'react-router-dom'
import { EnumRouterLink } from '@/constants/paths'
import { useIsSettingOpen, useSettingTab } from '@/hooks/use-config'
import { useTranslation } from 'react-i18next'
import { SettingsTab } from '@/constants/settings'
import { toast } from 'sonner'

const getInitial = (str: string | null | undefined) => {
  if (str && typeof str === 'string' && str.length > 0) {
    return str.charAt(0).toUpperCase()
  }
  return null
}

export default function NavUser() {
  const user = useUser()
  const navigate = useNavigate()
  // const [, setIsIntro] = useIsIntro()
  const { t } = useTranslation()
  const [, setIsSettingOpen] = useIsSettingOpen()
  const [, setActiveTab] = useSettingTab()

  const handleLogout = () => {
    if (!supabase) {
      toast.error('Supabase is not initialized')
      return
    }
    supabase.auth.signOut()
  }

  const handleOnBoarding = () => {
    // setIsIntro(true)
    navigate(EnumRouterLink.LanguageSelection)
  }

  const handleOpenSetting = () => {
    setActiveTab(SettingsTab.General)
    setIsSettingOpen(true)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem className="mb-3 cursor-pointer">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleOpenSetting}>
            <Settings className="h-5 w-5" />
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
