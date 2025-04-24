import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Pin, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteNote, updateNote } from '@/services'
import { INote } from '@/types'
import { EnumRouterLink } from '@/constants/paths'
import { findNextId } from '@/services/helper'
import { useNotes } from '@/hooks/use-note'
import { useTranslation } from 'react-i18next'

export default function NoteList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: notes } = useNotes()
  const { mutateAsync: mutateUpdateNote } = useMutation({
    mutationFn: (newNote: INote) => updateNote(newNote.id, newNote),
  })

  const handlePinNote = async (note: INote) => {
    const newData = { ...note, is_pin: !note.is_pin }
    await mutateUpdateNote(newData)
    queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  const handleDelete = async (id: INote['id']) => {
    await deleteNote(id)
    await queryClient.invalidateQueries({ queryKey: ['notes'] })

    const nextNoteId = findNextId<INote>(notes || [], id)
    if (nextNoteId) {
      navigate(EnumRouterLink.NoteDetail.replace(':noteId', nextNoteId))
    } else {
      navigate(EnumRouterLink.NoteNew)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {notes?.map((note) => (
        <ContextMenu key={note.id}>
          <ContextMenuTrigger>
            <NavLink to={`/notes/${note.id}`}>
              {({ isActive }) => {
                return (
                  <div
                    className={cn(
                      'relative flex w-full flex-col items-start overflow-hidden rounded-md px-3 py-2 hover:bg-sidebar-background-selected hover:text-sidebar-foreground-selected',
                      isActive ? 'bg-sidebar-background-selected text-sidebar-foreground-selected' : '',
                    )}
                  >
                    <div
                      className={cn(
                        'text-headline line-clamp-1 w-full text-base font-medium text-headline-sidebar',
                        isActive ? 'text-headline-sidebar-selected' : '',
                      )}
                    >
                      {note.title || t('sidebar.newNote')}
                    </div>
                    <div className="line-clamp-1 w-full pt-1 text-sm">
                      {note.content || t('sidebar.newNoteDescription')}
                    </div>
                    <div className="flex items-center pt-2 text-xs font-light">
                      {note.is_pin && <Pin className="mr-1 h-3 w-3" />}
                      {new Date(note.create_at * 1000).toLocaleDateString()}
                    </div>
                  </div>
                )
              }}
            </NavLink>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem className="flex items-center gap-2" onClick={() => handlePinNote(note)}>
              <Pin className="h-4 w-4" />
              {note.is_pin ? t('sidebar.unpin') : t('sidebar.pin')}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="flex items-center gap-2" onClick={() => handleDelete(note.id)}>
              <Trash className="h-4 w-4" />
              {t('sidebar.delete')}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  )
}
