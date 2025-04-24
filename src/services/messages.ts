import { localRequest } from '@/lib/request'
import { IMessage, IBaseModel, IConversation } from '@/types'

export async function getMessages(id: IConversation['id']) {
  return localRequest.get(`chat/conversations/${id}/messages`).json<IMessage[]>()
}

export async function getMessage(id: IMessage['id']) {
  return localRequest.get(`message/${id}`).json<IMessage>()
}

export async function createMessage(newMessage: Omit<IMessage, keyof IBaseModel>) {
  return localRequest
    .post('message/', {
      body: JSON.stringify(newMessage),
    })
    .json<IMessage>()
}

export async function updateMessage(id: IMessage['id'], updatedMessage: IMessage) {
  return localRequest
    .put(`message/${id}`, {
      body: JSON.stringify(updatedMessage),
    })
    .json<IMessage>()
}

export async function deleteMessage(id: IMessage['id']) {
  return localRequest.delete(`chat/message/${id}`).json<{ ids: IMessage['id'][] }>()
}
