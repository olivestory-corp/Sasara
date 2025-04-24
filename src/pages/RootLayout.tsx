import { useEffect, useState } from 'react'
import { useDeepLinkParams } from '@/hooks/use-deep-link-params'
import { Toaster } from '@/components/ui/sonner'
import supabase from '@/lib/supabase'
import { Outlet, useNavigate } from 'react-router-dom'
import CustomTitleBar from './CustomTitleBar'
import { useConfig } from '@/hooks/use-config'
import { useUser } from '@/lib/supabase/hooks'

import CreateAccount from './setting/CreateAccount'
import { Dialog, DialogContent } from '@/components/ui/dialog'
// import { useToggleDarkMode } from '@/hooks/use-electron'
import { useUpgradeAlert, useNoPremiumAlert } from '@/hooks/use-subscription'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import Account from './setting/Account'
import { useTranslation } from 'react-i18next'
import SettingsDialog from './dialog/SettingsDialog'
import { syncLocalMode } from '@/services'
import { EnumRouterLink } from '@/constants/paths'

export default function RootLayout() {
  const { t } = useTranslation()
  const [config, setConfig] = useConfig()
  const user = useUser()
  const [showNoLogin, setShowNoLogin] = useState(false)
  const [showUpgradeAlert, setShowUpgradeAlert] = useUpgradeAlert()
  const [showNoPremium, setShowNoPremium] = useNoPremiumAlert()
  const navigate = useNavigate()
  // useToggleDarkMode()

  const [, deepLinkParams] = useDeepLinkParams<{
    access_token: string
    refresh_token: string
  }>()

  useEffect(() => {
    if (!deepLinkParams) return
    const setSession = async () => {
      console.log(`Setting session: ${deepLinkParams.access_token} | ${deepLinkParams.refresh_token}`)
      if (!supabase) return
      const response = await supabase.auth.setSession({
        access_token: deepLinkParams.access_token,
        refresh_token: deepLinkParams.refresh_token,
      })
      console.log(`Response: ${JSON.stringify(response)}`)
      const session = await supabase.auth.getSession()
      console.log(`Session: ${JSON.stringify(session)}`)
      const user = await supabase.auth.getUser()
      console.log(`User: ${JSON.stringify(user)}`)
    }
    setSession()
  }, [deepLinkParams])

  useEffect(() => {
    if (typeof user === 'undefined') return
    if (config.privateMode) {
      setShowNoLogin(false)
      return
    }
    if (!supabase) {
      // toast.error('Supabase is not initialized')
      setConfig((config) => ({ ...config, privateMode: true }))
      return
    }
    setShowNoLogin(!config.privateMode && !user)
  }, [user, config.privateMode, setConfig])

  const handleNoLogin = async () => {
    await syncLocalMode(true)
    setConfig((config) => ({ ...config, privateMode: true }))
    navigate(EnumRouterLink.DownloadingService)
  }

  // const handleNoPremium = () => {
  //   setConfig((config) => ({ ...config, privateMode: true }))
  // }
  const handleShowNoPremium = () => {
    setShowUpgradeAlert(false)
    setShowNoPremium(true)
  }

  const handleSwitchToLocalMode = async () => {
    await syncLocalMode(true)
    setShowNoPremium(false)
    setConfig((config) => ({ ...config, privateMode: true }))
    navigate(EnumRouterLink.DownloadingService)
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <CustomTitleBar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <Dialog open={showNoLogin} onOpenChange={handleNoLogin}>
        <DialogContent aria-describedby="no-login-description">
          <CreateAccount />
        </DialogContent>
      </Dialog>
      <Dialog open={showNoPremium} onOpenChange={setShowNoPremium}>
        <DialogContent className="max-w-5xl">
          <Account />
        </DialogContent>
      </Dialog>
      <AlertDialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('upgrade.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('upgrade.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('upgrade.cancel')}</AlertDialogCancel>
            <AlertDialogCancel onClick={handleSwitchToLocalMode}>{t('upgrade.switchToLocalMode')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleShowNoPremium}>{t('upgrade.upgrade')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SettingsDialog />
      <Toaster position="top-center" />
    </div>
  )
}
