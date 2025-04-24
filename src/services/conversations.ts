import { localRequest } from '@/lib/request'
import { IBaseModel, IConversation, IConversationDetail } from '@/types'

export async function getConversations(params?: { keyword?: string }) {
  return localRequest.get('chat/conversations', { searchParams: params }).json<IConversation[]>()
}

export async function getConversationWithMessages(id: IConversation['id']) {
  return localRequest.get(`chat/conversations/${id}`).json<IConversationDetail>()
}

export async function createConversation(defaultConversation?: Partial<Omit<IConversation, keyof IBaseModel>>) {
  return localRequest.post('chat/conversation', { json: defaultConversation }).json<{ conversation: IConversation }>()
}

export async function updateConversation(id: IConversation['id'], updatedConversation: IConversation) {
  return localRequest
    .put(`chat/conversations/${id}`, {
      json: updatedConversation,
    })
    .json<IConversation>()
}

export async function deleteConversation(id: IConversation['id']) {
  return localRequest.delete(`chat/conversations/${id}`).json<IConversation>()
}

export async function updateConversationSettings(
  id: IConversation['id'],
  updatedConversation: Omit<IConversation, keyof IBaseModel>,
) {
  const result = await localRequest
    .put(`base/conversation/setting`, {
      json: {
        id,
        ...updatedConversation,
      },
    })
    .json<IConversation>()
  return result
}

export function generateConversationTitle(id: IConversation['id']) {
  return localRequest.post(`chat/conversation/title/${id}`).json<IConversation>()
}

export function updateConversationTitle(id: IConversation['id'], title: string) {
  return localRequest.put(`chat/conversations/${id}`, { json: { title } }).json<IConversation>()
}
