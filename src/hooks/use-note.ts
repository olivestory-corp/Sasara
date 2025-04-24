import { createNote, getNote, getNotes } from '@/services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSortConfig, useSearchConfig, useConfig } from './use-config'
import { sortNotes } from '@/services/helper'
import { useParams, useSearchParams } from 'react-router-dom'
import { useConversationDetailById, useConversations } from './use-conversation'

export function useCurrentNote() {
  const { noteId = '' } = useParams()
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId),
  })
}

export function useNotes() {
  const [sortConfig] = useSortConfig()
  const [searchConfig] = useSearchConfig()
  const [config] = useConfig()
  const local_mode = config.privateMode ?? true
  const sortBy = sortConfig.sortByField.note
  const sortOrder = sortConfig.sortOrderField.note
  const keyword = searchConfig.searchByField.note
  return useQuery({
    queryKey: ['notes', sortBy, sortOrder, keyword, local_mode],
    queryFn: () => getNotes({ keyword }).then((notes) => sortNotes(notes, sortBy, sortOrder)),
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => createNote(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useCurrentConversationByNote() {
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversationId')
  const { data: conversations } = useConversations()
  // const { data: note } = useCurrentNote()

  if (conversationId) {
    return conversations?.find((conversation) => conversation.id === conversationId)
  }
  // if (note) {
  //   return conversations?.find((conversation) => conversation.note_ids.includes(note.id))
  // }
  return null
}

export function useCurrentConversationDetailByNote() {
  const currentConversation = useCurrentConversationByNote()
  return useConversationDetailById({ id: currentConversation?.id })
}
