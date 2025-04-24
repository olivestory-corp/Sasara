import { useState } from 'react'
import { DEEP_LINK_PREFIX } from '@/constants/paths'
import { IpcRendererEvent } from 'electron'
import { useIpcListener } from './use-ipc-listener'

function getDeepLinkParams<T>(url: string): [string, T] | null {
  const reg = new RegExp(`^${DEEP_LINK_PREFIX}(.*)$`)
  const match = url.match(reg)
  if (!match) return null
  const [, path] = match
  const url_ = path.split('#')[0]
  const hash = path.split('#')[1]
  const params = Object.fromEntries(new URLSearchParams(hash)) as T
  return [url_, params] as const
}

export function useDeepLinkParams<T = Record<string, string>>() {
  const [url_, setUrl] = useState('')
  const [params, setParams] = useState<T | null>(null)
  useIpcListener('open-url', (event: IpcRendererEvent, deepLink: string) => {
    console.log('Received URL:', deepLink)
    const params = getDeepLinkParams<T>(deepLink)
    setUrl(params?.[0] || '')
    setParams(params?.[1] || null)
  })

  return [url_, params] as const
}
