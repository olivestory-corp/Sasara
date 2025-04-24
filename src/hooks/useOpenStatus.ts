import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const openInspectorStatusAtom = atomWithStorage<boolean>('openInspectorStatus', false)
const openSidebarStatusAtom = atomWithStorage<boolean>('openSidebarStatus', false)
const openNoteInspectorStatusAtom = atomWithStorage<boolean>('openNoteInspectorStatus', false)

export function useOpenInspectorStatus() {
  return useAtom(openInspectorStatusAtom)
}

export function useOpenSidebarStatus() {
  return useAtom(openSidebarStatusAtom)
}

export function useOpenNoteInspectorStatus() {
  return useAtom(openNoteInspectorStatusAtom)
}
