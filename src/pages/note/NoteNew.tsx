import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EnumRouterLink } from '@/constants/paths'
import { useNotes, useCreateNote } from '@/hooks/use-note'

export default function NoteNew() {
  const navigate = useNavigate()
  const { data: notes } = useNotes()
  const { mutateAsync: createNote } = useCreateNote()

  useEffect(() => {
    if (!notes) return
    const [one] = notes
    if (one) {
      // Default redirect to the first item
      navigate(EnumRouterLink.NoteDetail.replace(':noteId', one.id))
    }
  }, [navigate, notes])

  useEffect(() => {
    if (notes && notes.length === 0) {
      createNote()
    }
  }, [createNote, notes])

  return null
}
