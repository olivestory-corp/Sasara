import { getMainWindow } from '../window'
import ollama, { ProgressResponse } from 'ollama'
import { AbortableAsyncIterator, OllamaProgressResponse } from '../../types'

const progressResponseMap = new Map<string, AbortableAsyncIterator<ProgressResponse>>()

export async function pullModel(modelName: string) {
  const setProgress = (progress: OllamaProgressResponse) => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return
    mainWindow.webContents.send('ollama:pull-progress', progress)
  }

  const progressResponse = await ollama.pull({
    model: modelName,
    stream: true,
  })

  progressResponseMap.set(modelName, progressResponse)

  try {
    // Use for await...of to iterate through the async stream
    for await (const progress of progressResponse) {
      // progress contains download progress information
      console.log('Download progress:', progress)
      // Here we can update the UI to display progress
      setProgress({
        name: modelName,
        progress,
      })
    }
  } catch (error) {
    console.error('Download model error:', error)
    setProgress({
      name: modelName,
      error: (error as Error).message,
    })
  }
}

export async function pauseModel(modelName: string) {
  const progressResponse = progressResponseMap.get(modelName)
  if (progressResponse) {
    progressResponse.abort()
  }
}

export async function deleteModel(modelName: string) {
  await ollama.delete({
    model: modelName,
  })
}
