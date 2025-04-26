import Editor from '@/components/editor/Editor'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateNote } from '@/services'
import { INote, IEditorProps } from '@/types'
import { useCallback } from 'react'
import EmptyNote from '@/components/EmptyNote'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCurrentNote } from '@/hooks/use-note'

export default function NoteDetail() {
  const { data: note, isLoading } = useCurrentNote()
  const queryClient = useQueryClient()
  const { mutateAsync: updateNoteMutateAsync } = useMutation({
    mutationFn: (newNote: INote) => updateNote(newNote.id, newNote),
  })

  console.log('NoteDetail - isLoading:', isLoading)
  console.log('NoteDetail - note:', note)
  console.log('NoteDetail - note html_content:', note?.html_content)

  const handleContentChange = useCallback<IEditorProps['onContentChange']>(
    async (params) => {
      if (!note) return

      const newNote = { ...note, content: params.content, title: params.title, html_content: params.html }

      const newNoteUpdated = await updateNoteMutateAsync(newNote)

      queryClient.setQueryData(['note', newNoteUpdated.id], newNoteUpdated)
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
    [note, queryClient, updateNoteMutateAsync],
  )

  // html_content가 '#'이고 content가 있는 경우 content를 사용
  const editorContent = note?.html_content === '#' && note?.content 
    ? `<h1>${note.title}</h1>${note.content}`
    : note?.html_content || ''

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-3xl px-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : !note ? (
          <EmptyNote />
        ) : (
          <Editor key={note.id} content={editorContent} onContentChange={handleContentChange} />
        )}
      </div>
    </ScrollArea>
  )
}
