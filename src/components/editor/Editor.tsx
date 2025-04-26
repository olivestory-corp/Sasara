import { useCallback, useMemo } from 'react'
import { EditorProvider, EditorContent, EditorEvents, JSONContent } from '@tiptap/react'
import extensions from '@/lib/extensions'
import { EditorContext } from '@/lib/contexts/editor'
import { useEditorState } from '@/hooks/use-editor-state'
import TextMenu from './text-menu'
import { cn, getParentScrollElement } from '@/lib/utils'
import { IEditorProps } from '@/types'
import { useThrottleCallback } from '@/hooks/use-throttle'
function extractTextFromNode(node: JSONContent, maxLength?: number): string {
  if (!node.content) return ''

  const text = node.content
    .map((c) => c.text)
    .join('')
    .trim()

  if (maxLength && text.length > maxLength) {
    return text.slice(0, maxLength)
  }

  return text
}

// Title is taken from the first line with content
function extractTitleFromJSON(json: JSONContent): string {
  if (json.type !== 'doc' || !json.content) return ''

  for (const node of json.content) {
    // const isHeading1 = node.type === 'heading' && node.attrs?.level === 1
    // const isParagraph = node.type === 'paragraph'
    // if (isHeading1 || isParagraph) {
    const text = extractTextFromNode(node, 200)
    if (text) return text
    // }
  }

  return ''
}

export default function Editor({ content, onContentChange }: IEditorProps) {
  console.log('Editor - content:', content)
  
  const editorState = useEditorState()
  const providerValue = useMemo(() => {
    return {
      contentId: editorState.contentId,
      editable: editorState.editable,
      setContentId: editorState.setContentId,
      setEditable: editorState.setEditable,
    }
  }, [editorState])

  const handleContentChange = useThrottleCallback(
    useCallback(
      ({ editor }: EditorEvents['update']) => {
        const html = editor.getHTML()
        const json = editor.getJSON()
        const text = editor.getText()
        const title = extractTitleFromJSON(json)
        const content = text.startsWith(title) ? text.slice(title.length).trim() : text
        
        console.log('Editor - handleContentChange:', { html, json, text, title, content })
        
        onContentChange?.({
          html,
          json,
          title,
          text,
          content,
        })
      },
      [onContentChange],
    ),
    1,
  )

  const handleSelectionChange = ({ editor }: EditorEvents['selectionUpdate']) => {
    const selection = editor.state.selection
    if (selection.from === selection.to) {
      // When the selection is empty, get a single node from the starting position of the selection
      const endPos = editor.view.coordsAtPos(selection.to)
      // Get the height of the editor container
      const editorElement = getParentScrollElement(editor.view.dom)
      if (!editorElement) return

      const editorHeight = editorElement.clientHeight

      // Calculate the distance of the node from the bottom
      const distanceFromBottom = editorHeight - endPos.bottom
      // keep bottom 60
      const DEFAULT_BOTTOM_DISTANCE = 72
      const shouldScrollTop = Math.max(0, DEFAULT_BOTTOM_DISTANCE - distanceFromBottom)
      if (shouldScrollTop > 0) {
        editorElement.scrollTop = editorElement.scrollTop + shouldScrollTop
      }
    }
  }

  // content가 '#'이거나 비어있는 경우 빈 문자열로 처리
  const editorContent = content === '#' ? '' : content || ''

  return (
    <div className="relative">
      <EditorContext.Provider value={providerValue}>
        <EditorProvider
          onUpdate={handleContentChange}
          onSelectionUpdate={handleSelectionChange}
          extensions={extensions}
          content={editorContent}
          autofocus
          editorProps={{
            attributes: {
              class: cn('pt-8 prose pb-[30vh] box-border outline-none'),
            },
          }}
        >
          <EditorContent editor={null} />
          <TextMenu />
        </EditorProvider>
      </EditorContext.Provider>
    </div>
  )
}
