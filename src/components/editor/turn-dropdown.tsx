import {
  LucideCaseSensitive,
  LucideHeading1,
  LucideHeading2,
  LucideHeading3,
  LucideHeading4,
  LucideListOrdered,
  LucideList,
  LucideQuote,
  LucideListTodo,
  LucideCode,
  ChevronDownIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useCurrentEditor } from '@tiptap/react'

export default function TurnDropdown({ toolbarRef }: { toolbarRef: React.MutableRefObject<null> }) {
  const { editor } = useCurrentEditor()
  if (!editor) return null

  const dropdownItems = [
    {
      label: 'Text',
      icon: <LucideCaseSensitive size={20} strokeWidth={1.5} />,
      onClick: () => editor.chain().focus().setNode('paragraph').run(),
      checked:
        editor.isActive('paragraph') &&
        !editor.isActive('bulletList') &&
        !editor.isActive('orderedList') &&
        !editor.isActive('blockquote') &&
        !editor.isActive('taskList'),
    },
    {
      label: 'Heading 1',
      icon: <LucideHeading1 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      checked: editor.isActive('heading', { level: 1 }),
    },
    {
      label: 'Heading 2',
      icon: <LucideHeading2 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      checked: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Heading 3',
      icon: <LucideHeading3 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      checked: editor.isActive('heading', { level: 3 }),
    },
    {
      label: 'Heading 4',
      icon: <LucideHeading4 size={16} />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
      checked: editor.isActive('heading', { level: 4 }),
    },
    // task list
    {
      label: 'Task List',
      icon: <LucideListTodo size={16} />,
      onClick: () => editor.chain().focus().toggleTaskList().run(),
      checked: editor.isActive('taskList'),
    },
    {
      label: 'Bullet List',
      icon: <LucideList size={16} />,
      onClick: () => {
        if (editor.isActive('blockquote')) {
          editor.chain().focus().toggleBlockquote().toggleBulletList().run()
        } else {
          editor.chain().focus().toggleBulletList().run()
        }
      },
      checked: editor.isActive('bulletList'),
    },
    {
      label: 'Number List',
      icon: <LucideListOrdered size={16} />,
      onClick: () => {
        if (editor.isActive('blockquote')) {
          editor.chain().focus().toggleBlockquote().toggleOrderedList().run()
        } else {
          editor.chain().focus().toggleOrderedList().run()
        }
      },
      checked: editor.isActive('orderedList'),
    },
    // quote
    {
      label: 'Blockquote',
      icon: <LucideQuote size={14} />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      checked: editor.isActive('blockquote'),
    },
    // code block
    {
      label: 'Code Block',
      icon: <LucideCode size={16} />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      checked: editor.isActive('codeBlock'),
    },
  ]
  type DropdownItem = (typeof dropdownItems)[number]

  const currentItem = dropdownItems.find((item) => item.checked)

  const handleSelect = (item: DropdownItem) => {
    if (item.label === 'Blockquote') {
      if (!item.checked) {
        editor.chain().focus().clearNodes().toggleBlockquote().run()
      } else {
        editor.chain().focus().toggleBlockquote().run()
      }
      return
    }
    if (editor.isActive('blockquote')) {
      editor.chain().focus().toggleBlockquote().run()
    }
    item.onClick()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-7 w-auto px-[6px]">
          <span>{currentItem?.label || 'Text'}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent container={toolbarRef.current} sideOffset={4} className="text-muted-foreground">
        {dropdownItems.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.label}
            checked={item.checked}
            onSelect={() => handleSelect(item)}
            className="h-7 cursor-pointer py-0"
          >
            <span className="mr-2 flex w-6 items-center justify-center">{item.icon}</span>
            <span>{item.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
