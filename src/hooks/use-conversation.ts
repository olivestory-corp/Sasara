import {
  createConversation,
  getConversations,
  getConversationWithMessages,
  updateConversationSettings,
  updateConversationTitle,
} from '@/services'
import { IConversation, IConversationSettings, ILlmModel, ILlmProvider, IModelLanguage, INote } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useAllLlmModels,
  useAllPrivateLlmModels,
  useAllPrivateProviders,
  useAllProviders,
  useDefaultLlmProvider,
  useDefaultPrivateLlmProvider,
  useLlmModel,
  useLlmProvider,
  usePrivateLlmModel,
  usePrivateLlmProvider,
} from '@/hooks/use-llm'

import { useModelLanguages, useDefaultModelLanguage } from '@/hooks/use-language'
import { useParams, useNavigate } from 'react-router-dom'
import { useConfig, useSearchConfig, useSortConfig } from './use-config'
import { sortConversations } from '@/services/helper'
import { DEFAULT_MODEL_LANGUAGE } from '@/constants/languages'
import { EnumRouterLink } from '@/constants/paths'

export function useConversations() {
  const [sortConfig] = useSortConfig()
  const [searchConfig] = useSearchConfig()
  const [config] = useConfig()
  const local_mode = config.privateMode ?? true
  const sortBy = sortConfig.sortByField.conversation
  const sortOrder = sortConfig.sortOrderField.conversation
  const keyword = searchConfig.searchByField.conversation
  return useQuery({
    queryKey: ['conversations', sortBy, sortOrder, keyword, local_mode],
    queryFn: () =>
      getConversations({ keyword }).then((conversations) => sortConversations(conversations, sortBy, sortOrder)),
  })
}

export function useConversationsByNoteId({ noteId = '' }: { noteId?: INote['id'] }) {
  return useQuery({
    queryKey: ['conversationsByNoteId', noteId],
    queryFn: () =>
      getConversations({ keyword: '' }).then((conversations) =>
        conversations.filter((conversation) => conversation.note_ids.includes(noteId)),
      ),
    enabled: !!noteId,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  const settings = useConversationSettings()
  const defaultModelLanguage = useDefaultModelLanguage()
  return useMutation({
    mutationKey: ['createConversation', settings],
    mutationFn: async (params?: { note_ids?: INote['id'][] }) => {
      // When creating a new conversation, use the current values to continue using the previous conversation's model and provider
      const result = await createConversation({
        model_id: settings.selectedModel?.id || '',
        provider_id: settings.selectedProvider?.id || '',
        model_name: settings.selectedProvider?.cloud ? settings.selectedModel?.name : settings.selectedModel?.id,
        model_path: settings.selectedModel?.path || '',
        language_id: defaultModelLanguage?.id || DEFAULT_MODEL_LANGUAGE.id,
        ...params,
      })
      if (params?.note_ids) {
        await updateConversationSettings(result.conversation.id, {
          note_ids: params.note_ids,
          local_mode: settings.local_mode,
          provider_id: settings.selectedProvider?.id || '',
          model_id: settings.selectedModel?.id || '',
          model_name: settings.selectedProvider?.cloud
            ? settings.selectedModel?.name || ''
            : settings.selectedModel?.id || '',
          model_path: settings.selectedModel?.path || '',
          language_id: defaultModelLanguage?.id || DEFAULT_MODEL_LANGUAGE.id,
          system_prompt: settings.system_prompt,
          knowledge_ids: result.conversation.knowledge_ids,
          title: result.conversation.title,
          is_pin: result.conversation.is_pin,
        })
      }
      return result
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversationsByNoteId'] })
    },
  })
}

export function useConversationDetail() {
  const { conversationId = '' } = useParams()
  return useConversationDetailById({ id: conversationId })
}

export function useConversationDetailById({ id = '' }: { id?: IConversation['id'] }) {
  const navigate = useNavigate()
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () =>
      getConversationWithMessages(id).then((data) => {
        // If the conversation is not found, navigate to the new conversation page
        if (!data.conversation) {
          navigate(EnumRouterLink.ConversationNew)
        }
        return data
      }),
    enabled: !!id,
  })
}

export function useConversationSettings() {
  const { conversationId = '' } = useParams()
  return useConversationSettingsById({ id: conversationId })
}

export function useConversationSettingsById({ id = '' }: { id?: IConversation['id'] }) {
  const [config, setConfig] = useConfig()
  const queryClient = useQueryClient()

  const { data: conversationDetail } = useConversationDetailById({ id })
  const oldConversation = conversationDetail?.conversation

  const local_mode = config.privateMode ?? true

  // All providers
  const _allProviders = useAllProviders()
  const allPrivateProviders = useAllPrivateProviders()
  const allProviders = local_mode ? allPrivateProviders : _allProviders

  // Default provider
  const _defaultLlmProvider = useDefaultLlmProvider()
  const defaultPrivateLlmProvider = useDefaultPrivateLlmProvider()
  const defaultLlmProvider = local_mode ? defaultPrivateLlmProvider : _defaultLlmProvider

  // All models
  const _allModels = useAllLlmModels()
  const allPrivateModels = useAllPrivateLlmModels()
  const allModels = local_mode ? allPrivateModels : _allModels

  // Default model
  // const _defaultLlmModel = useDefaultLlmModel()
  // const defaultPrivateLlmModel = useDefaultPrivateLlmModel()
  const _defaultLlmModel = useLlmModel(_defaultLlmProvider?.defaultModel || '')
  const defaultPrivateLlmModel = usePrivateLlmModel(_defaultLlmProvider?.defaultModel || '')
  const defaultLlmModel = local_mode ? defaultPrivateLlmModel : _defaultLlmModel

  // Currently selected provider
  const _selectedProvider = useLlmProvider(oldConversation?.provider_id || '') || _defaultLlmProvider
  const selectedPrivateProvider = usePrivateLlmProvider(oldConversation?.provider_id || '') || defaultPrivateLlmProvider
  const selectedProvider = local_mode ? selectedPrivateProvider : _selectedProvider

  // Currently selected model
  const _selectedModel = useLlmModel(conversationDetail?.conversation?.model_id || '') || _defaultLlmProvider?.models[0]
  // For klee models, only select enabled ones
  const selectedPrivateModel =
    usePrivateLlmModel(conversationDetail?.conversation?.model_id || '') ||
    (defaultPrivateLlmProvider?.id === 'klee'
      ? defaultPrivateLlmProvider.models.find((model) => !model.disabled)
      : defaultPrivateLlmProvider?.models[0])
  const selectedModel = local_mode ? selectedPrivateModel : _selectedModel

  // const conversationProvider = useLlmProvider(oldConversation?.provider_id || '')
  // const conversationModel = useLlmModel(oldConversation?.model_id || '')

  // const _selectedModel = useLlmModel(conversationDetail?.conversation?.model_id || '') || _defaultLlmModel
  // const selectedPrivateModel =
  //   usePrivateLlmModel(conversationDetail?.conversation?.model_id || '') || defaultPrivateLlmModel

  const languages = useModelLanguages()
  const defaultLanguage = useDefaultModelLanguage()

  const selectedLanguageId = conversationDetail?.conversation.language_id || defaultLanguage?.id || 'auto'
  const system_prompt = conversationDetail?.conversation.system_prompt || ''
  const note_ids = conversationDetail?.conversation.note_ids || []
  const knowledge_ids = conversationDetail?.conversation.knowledge_ids || []

  const handleConversationSettingsChange = (conversation: Partial<IConversation>) => {
    const newConversation = Object.assign(
      {},
      oldConversation,
      {
        provider_id: selectedProvider?.id || '',
        model_id: selectedModel?.id || '',
        // IMPORTANT: model_name value: use model name for cloud, use model id for local/klee
        model_name: selectedProvider?.cloud ? selectedModel?.name : selectedModel?.id,
        language_id: selectedLanguageId,
        system_prompt,
        note_ids,
        knowledge_ids,
        model_path: selectedModel?.path,
        local_mode,
      },
      conversation,
    )
    console.log(
      '[renderer] -> useConversationSettings -> handleConversationSettingsChange',
      JSON.stringify(newConversation),
    )
    return updateConversationSettings(id, newConversation).then((data) => {
      queryClient.setQueryData(['conversation', id], (oldConversationDetail: { conversation: IConversation }) => {
        return {
          ...oldConversationDetail,
          conversation: newConversation,
        }
      })
      return data
    })
  }

  const handleConversationSettingsChangeByModel = (model?: ILlmModel, providerId?: ILlmProvider['id']) => {
    const provider = allProviders.find((provider) => provider.id === providerId)
    handleConversationSettingsChange({
      model_id: model?.id || '',
      model_name: provider?.cloud ? model?.name : model?.id,
      model_path: model?.path || '',
      provider_id: providerId || '',
    })
  }

  const setSelectedModelId = (modelId: ILlmModel['id']) => {
    // handleConversationSettingsChange({
    //   model_id: modelId,
    // })
    const model = allModels.find((model) => model.id === modelId)
    // if (!model) return

    handleConversationSettingsChangeByModel(model, model?.provider)
  }

  const setSelectedProviderId = (providerId: ILlmProvider['id']) => {
    const provider = allProviders.find((provider) => provider.id === providerId)

    // After setting provider, get models. First check if there's a configured default model, otherwise use the first model
    const model =
      provider?.id === 'klee'
        ? provider?.models.find((model) => !model.disabled)
        : provider?.defaultModel
        ? provider?.models.find((model) => provider.defaultModel === model.id)
        : provider?.models[0]

    handleConversationSettingsChangeByModel(model, providerId)
  }

  const setSelectedLanguageId = (languageId: IModelLanguage['id']) => {
    handleConversationSettingsChange({
      language_id: languageId,
    })
  }

  const setSystemPrompt = (systemPrompt: string) => {
    handleConversationSettingsChange({
      system_prompt: systemPrompt,
    })
  }

  const setNoteIds = (noteIds: IConversation['note_ids']) => {
    handleConversationSettingsChange({
      note_ids: noteIds,
    })
  }

  const setKnowledgeIds = (knowledgeIds: IConversation['knowledge_ids']) => {
    handleConversationSettingsChange({
      knowledge_ids: knowledgeIds,
    })
  }

  const setModelPath = (modelPath: IConversation['model_path']) => {
    const model = allModels.find((model) => model.provider === 'local')
    const name = modelPath?.split('/').pop() || ''
    setConfig((config) => ({ ...config, defaultLocalPrivateLlmModel: modelPath }))
    handleConversationSettingsChange({
      provider_id: model?.provider || '',
      model_id: name || '',
      model_name: name,
      model_path: modelPath,
    })
  }

  const setLocalMode = (localMode: IConversation['local_mode']) => {
    const model = localMode ? defaultPrivateLlmModel : _defaultLlmModel
    const provider = allProviders.find((provider) => provider.id === model?.provider)

    setConfig((config) => ({ ...config, privateMode: localMode }))
    handleConversationSettingsChange({
      local_mode: localMode,
      model_id: model?.id || '',
      model_name: provider?.cloud ? model?.name : model?.id,
      provider_id: model?.provider || '',
      model_path: model?.path || '',
    })
  }

  const data: IConversationSettings = {
    allProviders,
    defaultLlmModel,
    defaultLlmProvider,
    selectedProvider,
    selectedModel,
    selectedLanguageId,
    setSelectedProviderId,
    languages,
    defaultLanguage,
    setSelectedModelId,
    setSelectedLanguageId,
    system_prompt,
    setSystemPrompt,
    note_ids,
    setNoteIds,
    knowledge_ids,
    setKnowledgeIds,
    setModelPath,
    local_mode,
    setLocalMode,
    reset: () => handleConversationSettingsChange({}),
  }
  // console.log('[renderer] -> useConversationSettings', JSON.stringify(data))

  return data
}

// update conversation title
export function useUpdateConversationTitle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: IConversation['id']; title: string }) =>
      updateConversationTitle(conversationId, title),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversationsByNoteId'] })
    },
  })
}
