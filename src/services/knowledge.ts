import { localRequest } from '@/lib/request'
import { IKnowledge, IBaseModel } from '@/types'
import { createNewKnowledge } from './helper'

export async function getKnowledgeItems(params?: { keyword?: string }) {
  return localRequest.get('knowledge/', { searchParams: params || { keyword: '' } }).json<IKnowledge[]>()
}

export async function getKnowledgeItem(id: IKnowledge['id']) {
  return localRequest.get(`knowledge/${id}`).json<IKnowledge>()
}

export async function createKnowledgeItem(newKnowledge?: Partial<Omit<IKnowledge, keyof IBaseModel>>) {
  return localRequest
    .post('knowledge/', {
      json: createNewKnowledge(newKnowledge),
    })
    .json<IKnowledge>()
}

export async function updateKnowledgeItem(id: IKnowledge['id'], updatedKnowledge: IKnowledge) {
  return localRequest
    .put(`knowledge/${id}`, {
      json: updatedKnowledge,
    })
    .json<IKnowledge>()
}

export async function deleteKnowledgeItem(id: IKnowledge['id']) {
  return localRequest.delete(`knowledge/${id}`).json<IKnowledge>()
}
