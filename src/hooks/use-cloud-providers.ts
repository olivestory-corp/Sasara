import { getCloudProviders } from '@/services'
import { useQuery } from '@tanstack/react-query'
import { getLogoFromDirectory } from '@/lib/icon'
import { ILlmProvider } from '@/types'

export function getDefaultModelFromProvider(provider: ILlmProvider) {
  // TODO: Change to get uniformly by name
  const providerModelMap = {
    openai: 'c1b14737-0915-48f0-b4fd-a89ecdec8a21',
    anthropic: '54be6f9a-6814-4228-a393-53a4d57c5c90',
  }
  return providerModelMap[provider.id as keyof typeof providerModelMap] || ''
}

export function useCloudProviders() {
  return useQuery({
    queryKey: ['cloudProviders'],
    queryFn: () =>
      getCloudProviders().then((data) =>
        data.map((provider) => ({
          ...provider,
          defaultModel: getDefaultModelFromProvider(provider),
          icon: getLogoFromDirectory(provider.id),
          models: provider.models.map((model) => ({
            ...model,
            icon: getLogoFromDirectory(model.name),
          })),
        })),
      ),
  })
}
