import {
  IBaseModel,
  IKnowledge,
  IMessage,
  INote,
  ISortBy,
  ISortOrder,
  IConversation,
  IConversationSettings,
} from '@/types'
import { uuid } from '@/lib/utils'
import { EnumKnowledgeType } from '@/constants/paths'

export function sortNotes(notes: INote[], sortBy: ISortBy, sortOrder: ISortOrder) {
  const pinNotes: INote[] = []
  const normalNotes: INote[] = []
  notes.forEach((note) => {
    if (note.is_pin) {
      pinNotes.push(note)
      return
    }
    normalNotes.push(note)
  })
  const isDesc = sortOrder === 'desc'
  if (sortBy === 'updated_at') {
    pinNotes.sort((a, b) => (isDesc ? b.update_at - a.update_at : a.update_at - b.update_at))
    normalNotes.sort((a, b) => (isDesc ? b.update_at - a.update_at : a.update_at - b.update_at))
  } else if (sortBy === 'created_at') {
    pinNotes.sort((a, b) => (isDesc ? b.create_at - a.create_at : a.create_at - b.create_at))
    normalNotes.sort((a, b) => (isDesc ? b.create_at - a.create_at : a.create_at - b.create_at))
  } else {
    // by title
    pinNotes.sort((a, b) => (isDesc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)))
    normalNotes.sort((a, b) => (isDesc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)))
  }

  return [...pinNotes, ...normalNotes]
}

export function sortKnowledgeItems(knowledgeItems: IKnowledge[], sortBy: ISortBy, sortOrder: ISortOrder) {
  const pinKnowledgeItems: IKnowledge[] = []
  const normalKnowledgeItems: IKnowledge[] = []
  knowledgeItems.forEach((knowledgeItem) => {
    if (knowledgeItem.isPin) {
      pinKnowledgeItems.push(knowledgeItem)
      return
    }
    normalKnowledgeItems.push(knowledgeItem)
  })

  const isDesc = sortOrder === 'desc'
  if (sortBy === 'updated_at') {
    pinKnowledgeItems.sort((a, b) => (isDesc ? b.update_at - a.update_at : a.update_at - b.update_at))
    normalKnowledgeItems.sort((a, b) => (isDesc ? b.update_at - a.update_at : a.update_at - b.update_at))
  } else if (sortBy === 'created_at') {
    pinKnowledgeItems.sort((a, b) => (isDesc ? b.create_at - a.create_at : a.create_at - b.create_at))
    normalKnowledgeItems.sort((a, b) => (isDesc ? b.create_at - a.create_at : a.create_at - b.create_at))
  } else {
    // by title
    pinKnowledgeItems.sort((a, b) => (isDesc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)))
    normalKnowledgeItems.sort((a, b) => (isDesc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)))
  }

  return [...pinKnowledgeItems, ...normalKnowledgeItems]
}

export function findNextId<T extends IBaseModel>(oldItems: T[], id: T['id']) {
  let nextId: T['id'] = ''

  oldItems.filter((oldItem, index) => {
    const isMatch = oldItem.id === id
    if (isMatch) {
      const nextIndex = index === oldItems.length - 1 ? 0 : index + 1
      const nextNode = oldItems[nextIndex]
      if (nextNode && nextNode !== oldItem) {
        nextId = nextNode.id
      }
    }
    return !isMatch
  })

  return nextId
}

export function createNewMessage(params: Omit<IMessage, keyof IBaseModel>) {
  const message: IMessage = {
    id: uuid(),
    create_at: Date.now(),
    update_at: Date.now(),
    delete_at: null,
    content: params.content || '',
    role: params.role || 'user',
    conversation_id: params.conversation_id || '',
    status: params.status || 'pending',
  }
  return message
}

export function createNewNote(params?: Omit<INote, keyof IBaseModel>) {
  const note: INote = {
    id: uuid(),
    create_at: Date.now(),
    update_at: Date.now(),
    delete_at: null,
    folder_id: '',
    title: params?.title || '',
    content: params?.content || '',
    type: 'note',
    status: 'normal',
    is_pin: false,
    html_content: params?.html_content ?? '#',
  }
  return note
}

export function createNewKnowledge(params?: Partial<Omit<IKnowledge, keyof IBaseModel>>) {
  const knowledge: IKnowledge = {
    id: uuid(),
    create_at: Date.now(),
    update_at: Date.now(),
    delete_at: null,
    title: '',
    icon: '',
    description: '',
    category: params?.category || EnumKnowledgeType.Files,
    isPin: false,
    folder_path: '',
    timeStamp: Date.now(),
  }

  return knowledge
}

export function sortConversations(conversations: IConversation[], sortBy: ISortBy, sortOrder: ISortOrder) {
  const pinConversations: IConversation[] = []
  const normalConversations: IConversation[] = []

  conversations.forEach((conversation) => {
    if (conversation.is_pin) {
      pinConversations.push(conversation)
    } else {
      normalConversations.push(conversation)
    }
  })

  const isDesc = sortOrder === 'desc'
  const sortFunction = (a: IConversation, b: IConversation) => {
    if (sortBy === 'updated_at') {
      return isDesc ? b.update_at - a.update_at : a.update_at - b.update_at
    } else if (sortBy === 'created_at') {
      return isDesc ? b.create_at - a.create_at : a.create_at - b.create_at
    } else {
      // Sort by title
      return isDesc ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)
    }
  }

  pinConversations.sort(sortFunction)
  normalConversations.sort(sortFunction)

  return [...pinConversations, ...normalConversations]
}

export function createNewDefaultConversationParams(
  trimmedMessage = '',
  _conversation: Pick<IConversation, 'id' | 'title' | 'is_pin'>,
  settings: IConversationSettings,
) {
  const data = {
    question: trimmedMessage,
    // title: _conversation.title,
    // is_pin: _conversation.is_pin,
    conversation_id: _conversation.id,
    // local_mode: settings.local_mode,
    // knowledge_ids: settings.knowledge_ids,
    // note_ids: settings.note_ids,
    // provider_id: settings.selectedProvider?.id || '',
    // model_id: settings.selectedModel?.id || '',
    // model_path: settings.selectedModel?.path || '',
    // language_id: settings.selectedLanguageId || '',
    // system_prompt: settings.system_prompt || '',
    // model_name: settings.selectedModel?.name || '',
  }

  return data
}
