import { OllamaModelsResponse, OllamaModel, OllamaModelSearch } from '@/types'
import { getDefaultStore } from 'jotai'
import { OLLAMA_MODELS_SEARCH } from '@/constants/models'

const store = getDefaultStore()

// Get from environment variables
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'

export async function fetchOllamaModels(): Promise<OllamaModel[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
  if (!response.ok) {
    throw new Error('Failed to get Ollama model list')
  }
  const data: OllamaModelsResponse = await response.json()
  console.log(`Retrieved Ollama model data: ${JSON.stringify(data)}`)
  return data.models.map((model) => ({
    ...model,
    id: model.name,
  }))
}

export async function fetchOllamaModelsSearch(): Promise<OllamaModelSearch[]> {
  // Supabase를 사용하지 않고 로컬 모델만 사용
  return OLLAMA_MODELS_SEARCH
  /*
  if (!supabase) {
    console.log('No supabase client found, using local models')
    return store.get(ollamaModelsSearchAtom)
  }
  const { data, error } = await supabase.from('ollama_models').select('*')
  if (error) {
    console.error(`Failed to get Ollama model list: ${error}`)
    return store.get(ollamaModelsSearchAtom)
  }
  store.set(ollamaModelsSearchAtom, data)
  return data
  */
}
