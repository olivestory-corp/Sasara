import { useConfig } from '@/hooks/use-config'
import { IConversation, ILlmModel, ILlmProvider } from '@/types'
import { useCloudProviders } from './use-cloud-providers'
import { useCustomProviders } from './use-custom-provider'
import { useOllamaLlmModels } from './use-ollama'

import { useMemo } from 'react'
import { useConversationSettingsById } from './use-conversation'
import { useParams } from 'react-router-dom'

const DEFAULT_CLOUD_MODEL_ID = 'c1b14737-0915-48f0-b4fd-a89ecdec8a21'
const DEFAULT_CLOUD_PROVIDER_ID = 'openai'
// const DEFAULT_PRIVATE_MODEL_ID = 'deepseek-r1:1.5b'
const DEFAULT_PRIVATE_MODEL_ID = 'exaone3.5:2.4b'
const DEFAULT_PRIVATE_PROVIDER_ID = 'ollama'

export function useAllLlmModels() {
  const providers = useAllProviders()
  const models = useMemo(() => providers.flatMap((provider) => provider.models), [providers])
  return models
}
export function useAllPrivateLlmModels() {
  const privateProviders = useAllPrivateProviders()
  const privateLlmModels = useMemo(() => privateProviders.flatMap((provider) => provider.models), [privateProviders])
  return privateLlmModels
}

export function useAllProviders() {
  const { data: customProviders } = useCustomProviders()
  const { data: cloudProviders } = useCloudProviders()
  const providers = useMemo(
    () => [...(cloudProviders || []), ...(customProviders || [])],
    [cloudProviders, customProviders],
  )
  return providers
}
export function useAllPrivateProviders() {
  // const { t } = useTranslation()
  // const { data: kleeLLmModels } = useKleeLlmModels()
  const { data: ollamaLLmModels } = useOllamaLlmModels()
  // const localLlmModels = useLocalLlmModels()

  const privateProviders = useMemo(() => {
    const providers: ILlmProvider[] = [
      // { id: 'klee', name: 'Klee', description: '', icon: '', models: kleeLLmModels || [], apiKey: '', baseUrl: '' },
      {
        id: 'ollama',
        name: 'Ollama',
        description: '',
        icon: '',
        models: ollamaLLmModels || [],
        apiKey: '',
        baseUrl: '',
      },
      // {
      //   id: 'local',
      //   name: t('inspector.importFromLocalModel'),
      //   description: '',
      //   icon: '',
      //   models: localLlmModels || [],
      //   apiKey: '',
      //   baseUrl: '',
      // },
    ]
    return providers
  }, [ollamaLLmModels])

  return privateProviders
}

export function useLlmModel(modelId: ILlmModel['id']) {
  const allModels = useAllLlmModels()
  return allModels.find((model) => model.id === modelId)
}
export function usePrivateLlmModel(modelId: ILlmModel['id']) {
  const allPrivateModels = useAllPrivateLlmModels()
  return allPrivateModels.find((model) => model.id === modelId)
}

export function useLlmProvider(providerId: ILlmProvider['id']) {
  const allProviders = useAllProviders()
  return allProviders.find((provider: { id: string }) => provider.id === providerId)
}
export function usePrivateLlmProvider(providerId: ILlmProvider['id']) {
  const allProviders = useAllPrivateProviders()
  return allProviders.find((provider: { id: string }) => provider.id === providerId)
}

export function useDefaultLlmModel() {
  const [config] = useConfig()
  const defaultLlmModel = useLlmModel(config.defaultLlmModel || DEFAULT_CLOUD_MODEL_ID)
  return defaultLlmModel
}
export function useDefaultPrivateLlmModel() {
  const [config] = useConfig()
  const defaultLlmModel = usePrivateLlmModel(config.defaultPrivateLlmModel)
  return defaultLlmModel
}

export function useDefaultLlmProvider() {
  const defaultLlmModel = useDefaultLlmModel()
  const defaultLlmProvider = useLlmProvider(defaultLlmModel?.provider || DEFAULT_CLOUD_PROVIDER_ID)
  return defaultLlmProvider
}
export function useDefaultPrivateLlmProvider() {
  const defaultLlmModel = useDefaultPrivateLlmModel()
  const defaultLlmProvider = usePrivateLlmProvider(defaultLlmModel?.provider || DEFAULT_PRIVATE_PROVIDER_ID)
  return defaultLlmProvider
}

export function useSetDefaultLlmModel() {
  const [config, setConfig] = useConfig()
  return (model: ILlmModel) => {
    console.log('[renderer] -> useSetDefaultLlmModel', model.id, model)
    setConfig({ ...config, defaultLlmModel: model.id })
  }
}
export function useSetDefaultPrivateLlmModel() {
  const [config, setConfig] = useConfig()
  return (model: ILlmModel) => {
    console.log('[renderer] -> useSetDefaultPrivateLlmModel', model.id, model)
    setConfig({ ...config, defaultPrivateLlmModel: model.id })
  }
}

// Privacy mode
function useLocalLlmModels() {
  const [config] = useConfig()
  const localLlmModels = useMemo(() => {
    const defaultLocalPrivateLlmModel = config.defaultLocalPrivateLlmModel
    const name = defaultLocalPrivateLlmModel?.split('/').pop() || ''
    const llmModel: ILlmModel = {
      icon: '',
      provider: 'local',
      id: name || 'local',
      name: name || 'Local',
      path: defaultLocalPrivateLlmModel,
    }
    return [llmModel]
  }, [config])
  return localLlmModels
}

export function useRefetchLocalLlmModel() {
  // const [, setConfig] = useConfig()
  const { conversationId = '' } = useParams()
  return useRefetchLocalLlmModelById({ id: conversationId })
}

export function useRefetchLocalLlmModelById({ id }: { id: IConversation['id'] }) {
  // const [, setConfig] = useConfig()
  const { setModelPath } = useConversationSettingsById({ id })
  const refetchLocalLlmModel = async () => {
    const [path]: string[] = await window.ipcRenderer.invoke('dialog:openFile', 'All', false, true)
    if (!path) return
    // if (path) {
    //   setConfig((config) => ({ ...config, defaultLocalPrivateLlmModel: path }))
    // }
    setModelPath(path)
  }
  return refetchLocalLlmModel
}
