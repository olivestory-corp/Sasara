import supabase from '@/lib/supabase'
import { IFileLLmStat, IModel } from '@/types'

export async function getModels() {
  if (!supabase) {
    return []
  }
  const { data, error } = await supabase.from('models').select('*')
  if (error) {
    console.error(`Failed to get model list: ${error}`)
  }
  // console.log(`Successfully got model list: ${JSON.stringify(data)}`)
  return data as IModel[]
}

export async function getStatFileLlm(filename: string): Promise<IFileLLmStat> {
  try {
    return window.ipcRenderer.invoke('stat:file:llm', filename)
  } catch (error) {
    console.error(`Failed to get file status: ${error}`)
    return {
      status: 'waiting',
      message: 'file not found',
      data: null,
    }
  }
}
