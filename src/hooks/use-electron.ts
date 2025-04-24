import { useEffect, useState } from 'react'
// import { useTheme } from 'next-themes'

export function usePlatform() {
  const [platform, setPlatform] = useState<string>()
  useEffect(() => {
    window.ipcRenderer.invoke('get-platform').then(setPlatform)
  }, [])
  return platform
}

// export function useToggleDarkMode() {
//   // Use exact theme color values
//   const { resolvedTheme } = useTheme()
//   useEffect(() => {
//     window.ipcRenderer.invoke('toggle-dark-mode', resolvedTheme)
//   }, [resolvedTheme])
//   return null
// }
