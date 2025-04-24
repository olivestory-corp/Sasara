import { getCustomProviders, createCustomProvider, updateCustomProvider, deleteCustomProvider } from '@/services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ILlmProvider } from '@/types'

// 1. Get all customProviders
export function useCustomProviders() {
  return useQuery({
    queryKey: ['customProviders'],
    queryFn: () => {
      return getCustomProviders().then((providers) =>
        providers.map((provider) => ({
          ...provider,
          cloud: true,
          custom: true,
        })),
      )
    },
  })
}

// 2. Create new customProvider
export function useCreateCustomProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newProvider: Omit<ILlmProvider, 'id'>) => createCustomProvider(newProvider),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customProviders'] })
    },
  })
}

// 3. Update existing customProvider
export function useUpdateCustomProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updatedProvider: ILlmProvider) => updateCustomProvider(updatedProvider),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customProviders'] })
    },
  })
}

// 4. Delete customProvider
export function useDeleteCustomProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCustomProvider,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customProviders'] })
    },
  })
}
