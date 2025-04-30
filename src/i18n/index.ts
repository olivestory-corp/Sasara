import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import { ILanguage } from '@/types'
import LanguageDetector from 'i18next-browser-languagedetector'
import { configAtom } from '@/hooks/use-config'
import { getDefaultStore } from 'jotai'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  es: { translation: es },
  zh: { translation: zh }
}

const store = getDefaultStore()
const defaultLang = store.get(configAtom)?.language

i18next
  // Detect the user's current language
  // Documentation: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en' as ILanguage['id'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  })

// Save the language preference when it changes
i18next.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng)
})

if (import.meta.hot) {
  import.meta.hot.on('i18n-update', async ({ file, content }: { file: string; content: string }) => {
    const resources = JSON.parse(content)

    const lang = file.split('/').pop()?.replace('.json', '')
    if (!lang) return
    i18next.addResourceBundle(
      lang,
      'translation',
      resources,
      true,
      true
    )

    await i18next.reloadResources(lang, 'translation')
    i18next.changeLanguage(lang)
  })
}

export default i18next