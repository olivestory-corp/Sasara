export const USER_DIRECTORY_PATH = 'com.signerlabs.klee'

export const LARGE_LANGUAGE_MODELS_PATH = 'llm'

export const DEEP_LINK_PREFIX = 'klee://'

export enum EnumRouterLink {
  Home = '/',
  LanguageSelection = '/onboarding/language-selection',
  ModeSelection = '/onboarding/mode-selection',
  DownloadingService = '/onboarding/downloading-service',
  Auth = '/auth',

  ConversationNew = '/conversations/new',
  ConversationDetail = '/conversations/:conversationId',

  NoteNew = '/notes/new',
  NoteDetail = '/notes/:noteId',

  KnowledgeNew = '/knowledge/new',
  KnowledgeDetail = '/knowledge/:knowledgeId',
}

export enum EnumRouterField {
  Conversation = '/conversations',
  Knowledge = '/knowledge',
  Note = '/notes',
  Onboarding = '/onboarding',
}

export enum EnumKnowledgeType {
  Files = 'FILE',
  Folder = 'FOLDER',
}
