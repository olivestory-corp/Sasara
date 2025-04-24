import { ILanguage, IModelLanguage } from '@/types'
import { useConfig } from './use-config'
import { LANGUAGES, MODEL_LANGUAGES } from '@/constants/languages'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'

export function useLanguages() {
  return LANGUAGES
}

export function useLanguage(languageId: ILanguage['id']) {
  return LANGUAGES.find((language) => language.id === languageId)
}

export function useDefaultLanguage() {
  const [config] = useConfig()
  const defaultLanguage = useLanguage(config.language)
  return defaultLanguage
}

export function useSetDefaultLanguage() {
  const [, setConfig] = useConfig()
  return (languageId: ILanguage['id']) => {
    setConfig((prev) => ({ ...prev, language: languageId }))
    i18n.changeLanguage(languageId)
  }
}

// Model language
export function useModelLanguages() {
  const { t } = useTranslation()
  return MODEL_LANGUAGES.map((language) => ({
    ...language,
    name: language.id === 'auto' ? t('common.auto') : language.name,
  })) as unknown as IModelLanguage[]
}

export function useDefaultModelLanguage() {
  const [config] = useConfig()
  return useModelLanguage(config.modelLanguage)
}

export function useSetModelLanguage() {
  const [, setConfig] = useConfig()
  return (modelLanguageId: IModelLanguage['id']) => {
    setConfig((prev) => ({ ...prev, modelLanguage: modelLanguageId }))
  }
}

export function useModelLanguage(modelLanguageId: IModelLanguage['id']) {
  return useModelLanguages().find((language) => language.id === modelLanguageId)
}
