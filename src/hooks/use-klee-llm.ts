import { getModels, getStatFileLlm } from '@/services'
import { ILlmModel, IModel } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function useKleeLlmModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () =>
      getModels().then(async (models) => {
        const llmModels = await Promise.all(
          models.map(async (model) => {
            const filename = model.download_url.split('/').pop() || ''
            const statFileLlmData = await getStatFileLlm(filename)

            const downloaded = (statFileLlmData.data?.stats.size || 0) >= model.store_size
            const llmModel: ILlmModel & IModel = {
              ...model,
              provider: 'klee',
              icon: '',
              path: statFileLlmData.data?.path || '',
              download_url: model.download_url,
              downloadCompleted: downloaded,
              stat: statFileLlmData,
              disabled: !downloaded,
            }

            return llmModel
          }),
        )
        return llmModels
      }),
  })
}
