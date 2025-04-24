import { createContext } from 'react'

interface IEditorContext {
  contentId: string
  editable: boolean

  setContentId: (contentId: string) => void
  setEditable: (editable: boolean) => void
}

export const EditorContext = createContext<IEditorContext>({
  contentId: '',
  editable: true,
  setContentId: () => {},
  setEditable: () => {},
})
