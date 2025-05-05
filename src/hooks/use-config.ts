import { useAtom, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_BASE_COLOR } from '@/constants/base-colors'
import { SettingsTab } from '@/constants/settings'
import { OLLAMA_MODELS_SEARCH } from '@/constants/models'

import { IConfig, ISearchConfig, ISortConfig, OllamaModelSearch } from '@/types'

import { DEFAULT_MODEL_LANGUAGE } from '@/constants/languages'
// ... 기존 import 생략

export const configAtom = atomWithStorage<IConfig>('config-1.5', {
  theme: DEFAULT_BASE_COLOR,
  fontSize: 16,
  // 브라우저 언어에 따라 자동 설정 (한국어도 추가하고 싶으면 조건 확장 가능)
  language: navigator.language.startsWith('zh') ? 'zh'
          : navigator.language.startsWith('ko') ? 'ko'
          : navigator.language.startsWith('ja') ? 'ja'
          : navigator.language.startsWith('es') ? 'es'
          : 'en',
  // MODEL_LANGUAGES에서 지정한 기본값 사용
  modelLanguage: DEFAULT_MODEL_LANGUAGE.id,
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
