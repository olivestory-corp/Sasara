import { localRequest } from '@/lib/request'
import { INote, IBaseModel } from '@/types'
import { createNewNote } from '@/services/helper'

export async function getNotes(params?: { keyword?: string }) {
  return localRequest.get('note/', { searchParams: params || { keyword: '' } }).json<INote[]>()
}

export async function getNote(id: INote['id']) {
  return localRequest.get(`note/${id}`).json<INote>()
}

export async function createNote(newNote?: Omit<INote, keyof IBaseModel>) {
  return localRequest
    .post('note/', {
      json: createNewNote(newNote),
    })
    .json<INote>()
}

export async function updateNote(id: INote['id'], newNote: INote) {
  return localRequest
    .put(`note/${id}`, {
      json: newNote,
    })
    .json<INote>()
}

export async function deleteNote(id: INote['id']) {
  return localRequest.delete(`note/${id}`).json<INote>()
}
