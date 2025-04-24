import { IpcRendererEvent } from 'electron'
import { useEffect, useRef } from 'react'

export function useIpcListener<T>(channel: string, listener: (event: IpcRendererEvent, ...args: T[]) => void) {
  const callback = useRef(listener)
  useEffect(() => {
    const current = callback.current
    window.ipcRenderer?.off(channel, current)
    window.ipcRenderer?.on(channel, current)
    return () => {
      window.ipcRenderer?.off(channel, current)
    }
  }, [channel, callback])
}
