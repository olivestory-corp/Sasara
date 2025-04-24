import { fetchOllamaModels, fetchOllamaModelsSearch } from '@/services'
import { ILlmModel, OllamaSearchModel } from '@/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useConfig } from './use-config'

export function useInvalidateOllamaModels() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['ollamaModels'] })
  }
}

export function useOllamaLlmModels() {
  const [config] = useConfig()
  const privateMode = config.privateMode
  return useQuery({
    queryKey: ['ollamaModels', privateMode],
    queryFn: () => {
      if (!privateMode) {
        return []
      }
      return fetchOllamaModels().then((models) => {
        return models.map((model) => {
          const llmModel: ILlmModel = {
            ...model,
            provider: 'ollama',
            icon: '',
          }
          return llmModel
        })
      })
    },
    // Infinite retry on failure
    retry: true,
    // Check every two seconds when failing
    retryDelay: 2000,
  })
}

export function useOllamaModelsSearchQuery() {
  return useQuery({
    queryKey: ['ollamaModelsSearch'],
    // Sort from small to large
    queryFn: () => fetchOllamaModelsSearch().then((models) => models.sort((a, b) => (a.weight || 0) - (b.weight || 0))),
  })
}

export function useOllamaSearchModels() {
  const { data: ollamaModels } = useOllamaLlmModels()
  const { data: ollamaModelsSearch } = useOllamaModelsSearchQuery()
  const ollamaModelsMap = useMemo(() => new Map(ollamaModels?.map((model) => [model.id, model])), [ollamaModels])

  return ollamaModelsSearch?.map((model) => {
    const llmModel: OllamaSearchModel = {
      ...model,
      downloadCompleted: !!ollamaModelsMap.get(model.model_name),
    }
    return llmModel
  })
}
