import { localRequest } from '@/lib/request'
import { IKnowledge, IVector } from '@/types'

export async function createVectorsByLocalFilePaths(id: IKnowledge['id'], paths: string[]) {
  return localRequest.post(`knowledge/llama/add/files/${id}`, {
    json: { files: paths },
  })
}

export async function createVectorsByLocalFolderPath(id: IKnowledge['id'], path: string) {
  return localRequest.post(`knowledge/import/${id}`, {
    json: { path },
  })
}

export async function getVectors(id: IKnowledge['id']) {
  return localRequest.get(`knowledge/all/${id}`).json<IVector[]>()
}

export async function deleteVector(id: IVector['id']) {
  return localRequest.delete(`knowledge/file/${id}`)
}

export async function refreshVectorsByLocalFolderPath(id: IKnowledge['id'], path: string) {
  return localRequest.get(`knowledge/refresh/${id}?path=${path}`)
}
