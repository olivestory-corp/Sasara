import { useState } from 'react'

export type EditorStateType = {
  contentId: string
  editable: boolean

  setContentId: (contentId: string) => void
  setEditable: (editable: boolean) => void
}

export const useEditorState = (): EditorStateType => {
  const [contentId, setContentId] = useState('')
  const [editable, setEditable] = useState(false)

  return {
    contentId,
    editable,
    setContentId,
    setEditable,
  }
}
