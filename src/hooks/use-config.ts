import { useAtom, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_BASE_COLOR } from '@/constants/base-colors'
import { SettingsTab } from '@/constants/settings'
import { OLLAMA_MODELS_SEARCH } from '@/constants/models'

import { IConfig, ISearchConfig, ISortConfig, OllamaModelSearch } from '@/types'

export const configAtom = atomWithStorage<IConfig>('config-1.5', {
  theme: DEFAULT_BASE_COLOR,
  fontSize: 16,
  // Set English as default language
  language: 'en',
  // Default to English
  modelLanguage: 'en',
  privateMode: true,
  defaultLlmModel: '',
  defaultPrivateLlmModel: '',
  defaultLocalPrivateLlmModel: '',
})

export const sortConfigAtom = atomWithStorage<ISortConfig>('sortConfig', {
  sortByField: {
    conversation: 'updated_at',
    knowledge: 'updated_at',
    note: 'updated_at',
  },

  sortOrderField: {
    conversation: 'desc',
    knowledge: 'desc',
    note: 'desc',
  },
})

export const searchConfigAtom = atomWithStorage<ISearchConfig>('searchConfig', {
  searchByField: {
    conversation: '',
    knowledge: '',
    note: '',
  },
})

// Whether the language selection and mode selection in the onboarding page have been completed
export const introAtom = atomWithStorage<boolean>('intro-1.0', false)

export const isSettingOpenAtom = atom<boolean>(false)
export const settingTabAtom = atom<SettingsTab>(SettingsTab.General)

export function useConfig() {
  return useAtom(configAtom)
}

export function useSortConfig() {
  return useAtom(sortConfigAtom)
}

export function useSearchConfig() {
  return useAtom(searchConfigAtom)
}

// Whether the language selection and mode selection in the onboarding page have been completed
export function useIsIntro() {
  return useAtom(introAtom)
}

export function useIsSettingOpen() {
  return useAtom(isSettingOpenAtom)
}

export function useSettingTab() {
  return useAtom(settingTabAtom)
}

export const disconnectAtom = atom<boolean>(false)

export function useDisconnect() {
  return useAtom(disconnectAtom)
}

export const ollamaModelsSearchAtom = atomWithStorage<OllamaModelSearch[]>(
  'ollamaModelsSearch',
  OLLAMA_MODELS_SEARCH,
  undefined,
  {
    getOnInit: true,
  },
)

export function useOllamaModelsSearch() {
  return useAtom(ollamaModelsSearchAtom)
}
