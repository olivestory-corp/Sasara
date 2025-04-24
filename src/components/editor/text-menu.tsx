import { useCallback, useRef } from 'react'
import { BubbleMenu, Editor, useCurrentEditor } from '@tiptap/react'

import { FontBoldIcon, FontItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isTextSelection } from '@tiptap/core'
import TurnDropdown from './turn-dropdown'

export const isTextSelected = ({ editor }: { editor: Editor }) => {
  const {
    state: {
      doc,
      selection,
      selection: { empty, from, to },
    },
  } = editor

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection)

  if (empty || isEmptyTextBlock || !editor.isEditable) {
    return false
  }

  return true
}

export default function TextMenu() {
  const toolbarRef = useRef(null)
  const { editor } = useCurrentEditor()
  const shouldShow = useCallback(() => {
    if (!editor) return false

    const {
      state: {
        doc,
        selection,
        selection: { empty, from, to },
      },
    } = editor

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection)

    if (empty || isEmptyTextBlock || !editor.isEditable) {
      return false
    }

    // console.log('shouldShow...')

    return true
  }, [editor])

  if (!editor) {
    return null
  }
  // console.log('text menu render')

  // const handleChat = () => {
  //   const { state } = editor
  //   const { selection, doc } = state
  //   const { from, to } = selection
  //   const text = doc.textBetween(from, to)

  //   console.log('on chat', text)
  //   window.webkit?.messageHandlers?.onChat.postMessage({ text })
  // }

  return (
    <BubbleMenu editor={null} updateDelay={100} shouldShow={shouldShow}>
      <div
        ref={toolbarRef}
        className="flex items-center rounded-md border bg-popover p-1 text-muted-foreground shadow-md outline-none"
      >
        {/* <Button
          aria-label="Chat"
          size="icon"
          variant="ghost"
          onClick={handleChat}
          className={cn('h-7 w-auto px-[6px]')}
        >
          <span>Chat</span>
          <ChatBubbleIcon className="w-4 h-4 ml-2" />
        </Button>
        <div className="h-5 border-r mx-[6px]"></div> */}
        <TurnDropdown toolbarRef={toolbarRef} />
        <Button
          aria-label="Toggle bold"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-7 w-7', editor.isActive('bold') ? 'text-primary hover:text-primary' : '')}
        >
          <FontBoldIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Toggle italic"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('h-7 w-7', editor.isActive('italic') ? 'text-primary hover:text-primary' : '')}
        >
          <FontItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Toggle Underline"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn('h-7 w-7', editor.isActive('underline') ? 'text-primary hover:text-primary' : '')}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Toggle Strike"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn('h-7 w-7', editor.isActive('strike') ? 'text-primary hover:text-primary' : '')}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Toggle Code"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn('h-7 w-7', editor.isActive('code') ? 'text-primary hover:text-primary' : '')}
        >
          <CodeIcon className="h-4 w-4" />
        </Button>
      </div>
    </BubbleMenu>
  )
}
