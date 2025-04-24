import { EnumRouterLink } from '@/constants/paths'
import { useIsIntro } from '@/hooks/use-config'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CheckPoint() {
  const navigate = useNavigate()
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  const [isIntro] = useIsIntro()

  useEffect(() => {
    if (!isHydrated) return

    if (isIntro) {
      navigate(EnumRouterLink.LanguageSelection)
    } else {
      navigate(EnumRouterLink.DownloadingService)
    }
  }, [isIntro, navigate, isHydrated])

  return null
}
