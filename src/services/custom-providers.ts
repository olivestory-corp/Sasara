import { localRequest } from '@/lib/request'
import { ILlmProvider, IBaseModel } from '@/types'

// Get all custom providers
export async function getCustomProviders() {
  return localRequest.get('base/custom_providers').json<ILlmProvider[]>()
}

// Get a single custom provider
export async function getCustomProvider(id: ILlmProvider['id']) {
  return localRequest.get(`base/custom_providers/${id}`).json<ILlmProvider>()
}

// Create a new custom provider
export async function createCustomProvider(newProvider: Omit<ILlmProvider, keyof IBaseModel>) {
  return localRequest
    .post('base/custom_providers/', {
      json: newProvider,
    })
    .json<ILlmProvider>()
}

// Update an existing custom provider
export async function updateCustomProvider(updatedProvider: ILlmProvider) {
  return localRequest
    .put(`base/custom_providers/${updatedProvider.id}`, {
      json: updatedProvider,
    })
    .json<ILlmProvider>()
}

// Delete a custom provider
export async function deleteCustomProvider(id: ILlmProvider['id']) {
  return localRequest.delete(`base/custom_providers/${id}`).json<ILlmProvider>()
}
