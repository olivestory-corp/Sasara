import { useLocation } from 'react-router-dom'
import { EnumRouterField, EnumRouterLink } from '@/constants/paths'

export function useRouterField() {
  const location = useLocation()

  const isConversationField = location.pathname.startsWith(EnumRouterField.Conversation)
  const isConversationDetailField = isConversationField && !location.pathname.startsWith(EnumRouterLink.ConversationNew)
  const isKnowledgeField = location.pathname.startsWith(EnumRouterField.Knowledge)
  const isNoteField = location.pathname.startsWith(EnumRouterField.Note)
  const isOnboardingField = location.pathname.startsWith(EnumRouterField.Onboarding)

  const activeField = isConversationField
    ? 'conversation'
    : isKnowledgeField
    ? 'knowledge'
    : isNoteField
    ? 'note'
    : isOnboardingField
    ? 'onboarding'
    : ''
  return {
    activeField,
    conversation: isConversationField,
    conversationDetail: isConversationDetailField,
    knowledge: isKnowledgeField,
    note: isNoteField,
    onboarding: isOnboardingField,
  }
}
