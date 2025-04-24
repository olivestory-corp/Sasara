import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Underline from '@tiptap/extension-underline'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// load all languages with "all" or common languages with "common"
import { all, createLowlight } from 'lowlight'
// Without this extension, pressing backspace at the start of a list item keeps the list item content on the same line.
// With the List Keymap, the content is lifted into the list item above.
import ListKeymap from '@tiptap/extension-list-keymap'
// import BlockquoteFigure from './block-quote'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

// const CustomTableCell = TableCell.extend({
//   addAttributes() {
//     return {
//       // extend the existing attributes …
//       ...this.parent?.(),

//       // and add a new one …
//       backgroundColor: {
//         default: null,
//         parseHTML: element => element.getAttribute('data-background-color'),
//         renderHTML: attributes => {
//           return {
//             'data-background-color': attributes.backgroundColor,
//             style: `background-color: ${attributes.backgroundColor}`,
//           }
//         },
//       },
//     }
//   },
// })

const extensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  Markdown,
  Underline,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  CodeBlockLowlight.configure({
    // create a lowlight instance with all languages loaded
    lowlight: createLowlight(all),
  }),
  ListKeymap,
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'not-prose',
    },
  }),
  TableRow,
  TableHeader,
  // Default TableCell
  TableCell,
  // Custom TableCell with backgroundColor attribute
  // CustomTableCell,
]

export default extensions
