import supabase from '@/lib/supabase'
import { IBaseResponse, ILlmProvider } from '@/types'

export async function getCloudProviders() {
  if (!supabase) return []
  const { data, error } = await supabase.functions.invoke<IBaseResponse<ILlmProvider[]>>('modelService-fetchModels')
  if (error) {
    console.error(error)
    return []
  }
  if (data) {
    return data.data.map((item) => {
      return {
        ...item,
        cloud: true,
      }
    })
  }
  return []
}
