import { BaseColor } from '@/constants/base-colors'
import { LANGUAGES, MODEL_LANGUAGES } from '@/constants/languages'
import { EnumKnowledgeType } from '@/constants/paths'
import { EventSourceMessage } from '@/lib/parse'
import { JSONContent } from '@tiptap/core'
import { Stats } from 'fs'
import { UpdateInfo, ProgressInfo, UpdateCheckResult } from 'electron-updater'

export type IUpdateInfo = UpdateInfo
export type IProgressInfo = ProgressInfo
export type IUpdateCheckResult = UpdateCheckResult
export interface IErrorDetail {
  detail?: string
  message?: string
}

export interface IBaseModel {
  id: string
  create_at: number
  update_at: number
  delete_at: number | null
}

export interface IBaseResponse<T> {
  error_code: EnumErrorCode
  message: string
  data: T
}

export interface IConversation extends IBaseModel {
  title: string
  is_pin: boolean
  provider_id: ILlmProvider['id']
  model_id: ILlmModel['id']
  model_path: string
  language_id: IModelLanguage['id']
  system_prompt: string
  local_mode: boolean
  note_ids: INote['id'][]
  knowledge_ids: IKnowledge['id'][]

  model_name: string
}

export type IMessageRole = 'chatbot' | 'user'
export type IMessageStatus = 'pending' | 'success' | 'error'

export enum EnumErrorCode {
  None = '',
  // Free message count exceeded
  free_message_count_exceeded = 'free_message_count_exceeded',
  // Current subscription tokens used up
  subscription_token_exceeded = 'subscription_token_exceeded',
  // User not found
  user_not_found = 'user_not_found',
  // User not subscribed
  user_not_subscribed = 'user_not_subscribed',
  // No permission
  no_permission = 'no_permission',

  // Internal error
  internal_error = 'internal_error',
}

export interface IMessage extends IBaseModel {
  content: string
  role: IMessageRole
  conversation_id: IConversation['id']
  status: IMessageStatus
  error_message?: string
  error_code?: EnumErrorCode
}

export interface INote extends IBaseModel {
  content: string
  folder_id: string
  html_content: string
  is_pin: boolean
  status: 'normal' | 'deleted' | 'archived' // Adjust according to actual status values
  title: string
  type: 'note' // If there are other possible types, add them to the union type
}

export interface IKnowledge extends IBaseModel {
  category: EnumKnowledgeType
  description: string
  // embed_status: 'EMBEDDING' | 'COMPLETED' | 'FAILED' // Adjust possible status values according to actual situation
  folder_path: string
  icon: string
  isPin: boolean
  timeStamp: number
  title: string
}

export interface IModel extends IBaseOption {
  avatar_url: string
  brand: string
  create_at: number
  download_url: string
  require: string
  store_size: number
  update_at: number
  weight: number
}

export interface IFileLLmStat {
  data: {
    stats: Stats
    path: string
  } | null
  status: 'downloading' | 'completed' | 'interrupted' | 'paused' | 'waiting'
  message: string
}

export interface IDownloadProgress {
  name: string
  received: number
  total: number
  /** Download URL */
  url: string
  /** Save path */
  savePath: string
  state: 'progressing' | 'completed' | 'interrupted' | 'paused'
}

export interface IEditorProps {
  content: string
  onContentChange: (params: { html: string; json: JSONContent; title: string; text: string; content: string }) => void
}

export interface IVector extends IBaseModel {
  id: string
  os_mtime: number
  name: string
  path: string
  knowledgeId: string
  size: number
}

export interface IFetchEventSourceInit {
  onmessage?: (msg: EventSourceMessage) => void
  onerror?: (error: Error) => void
}

export interface IBaseOption {
  id: string
  name: string
  description?: string
  disabled?: boolean
}

export interface IBaseCheckOption extends IBaseOption {
  checked: boolean
}

export interface ILocalModel extends IBaseOption {
  path: string
  isDirectory: boolean
}

export interface ILlmProvider extends IBaseOption {
  description: string
  icon: string
  models: ILlmModel[]
  apiKey: string
  baseUrl: string
  cloud?: boolean
  custom?: boolean
  defaultModel?: ILlmModel['id']
}

export interface ILlmModel extends IBaseOption {
  icon: string
  provider: ILlmProvider['id']
  path?: string
  downloadCompleted?: boolean
  stat?: IFileLLmStat
  weight?: number
  download_url?: string
}

export interface ILlmModelWithDownloader extends IModel, ILlmModel {
  downloadProgress?: IDownloadProgress | null
  downloadStatus: 'downloading' | 'completed' | 'error' | 'paused' | 'waiting'
  weight: number
  download_url: string
}

export interface ILanguage extends IBaseOption {
  icon?: string
  id: (typeof LANGUAGES)[number]['id']
  name: (typeof LANGUAGES)[number]['name']
}

export interface IModelLanguage extends IBaseOption {
  id: (typeof MODEL_LANGUAGES)[number]['id']
  name: (typeof MODEL_LANGUAGES)[number]['name']
}

export interface UserSubscription {
  id: string // UUID
  user_id: string // UUID
  customer_id: string // Stripe customer ID
  subscription_id: string // Stripe subscription ID
  status: string // Subscription status
  price_ids: string[] // Array of price IDs
  current_period_start: number // Changed to number
  current_period_end: number // Changed to number
  cancel_at_period_end: boolean // Whether to cancel subscription at the end of current period
  canceled_at: number | null // Subscription cancellation time, null if not cancelled
  price_data: {
    [priceId: string]: {
      id: string
      unit_amount: number
      currency: string
      recurring?: {
        interval: string
        interval_count: number
      }
      // Can add more fields as needed
    }
  } // Price details
  metadata: Record<string, unknown> | null // Additional metadata
  created_at: number // Changed to number
  updated_at: number // Changed to number
}

export interface IConversationDetail {
  conversation: IConversation
  messages: IMessage[]
}

export type ISortBy = 'updated_at' | 'created_at'
export type ISortOrder = 'asc' | 'desc'

export type IConfig = {
  theme: BaseColor['name']
  fontSize: number
  language: ILanguage['id']
  modelLanguage: IModelLanguage['id']
  privateMode: boolean
  defaultLlmModel: ILlmModel['id']
  defaultPrivateLlmModel: ILlmModel['id']
  defaultLocalPrivateLlmModel: ILlmModel['path']
}

export type ISortConfig = {
  sortByField: {
    conversation: ISortBy
    knowledge: ISortBy
    note: ISortBy
  }
  sortOrderField: {
    conversation: ISortOrder
    knowledge: ISortOrder
    note: ISortOrder
  }
}

export interface ISearchConfig {
  searchByField: {
    conversation: string
    knowledge: string
    note: string
  }
}

export interface ModelDetails {
  format: string
  family: string
  families: string[] | null
  parameter_size: string
  quantization_level: string
}

export interface OllamaModel extends IBaseOption {
  modified_at: string
  size: number
  digest: string
  details: ModelDetails
}

export interface OllamaModelsResponse {
  models: OllamaModel[]
}

export interface IConversationSettings {
  // Provider related
  allProviders: ILlmProvider[]
  defaultLlmModel?: ILlmModel
  defaultLlmProvider?: ILlmProvider

  // Selection status
  selectedProvider: ILlmProvider | undefined
  selectedModel: ILlmModel | undefined
  selectedLanguageId: IModelLanguage['id']

  // Setting methods
  setSelectedProviderId: (id: ILlmProvider['id']) => void
  setSelectedModelId: (id: ILlmModel['id']) => void
  setSelectedLanguageId: (id: IModelLanguage['id']) => void

  // Language related
  languages: IModelLanguage[]
  defaultLanguage?: IModelLanguage
  defaultModelLanguage?: IModelLanguage

  // Prompts and context
  system_prompt: string
  setSystemPrompt: (prompt: string) => void
  note_ids: INote['id'][]
  setNoteIds: (ids: INote['id'][]) => void
  knowledge_ids: IKnowledge['id'][]
  setKnowledgeIds: (ids: IKnowledge['id'][]) => void

  // Local mode related
  setModelPath: (path: string) => void
  local_mode: boolean
  setLocalMode: (mode: boolean) => void

  reset: () => Promise<IConversation>
}

export interface IServiceVersion {
  version: string
  download_url: string
}

export interface ISource {
  id: string
  type: 'note' | 'knowledge'
  title: string
  isCurrent: boolean
  selected: boolean
}

export interface OllamaModelSearch {
  id: string | number
  model_name: string
  size: string
  recommend_ram: string
  provider: string
  weight: number
  created_at: string
}

export interface OllamaSearchModel extends OllamaModelSearch {
  downloadCompleted: boolean
}
