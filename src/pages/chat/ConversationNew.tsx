import { useConversations, useCreateConversation } from '@/hooks/use-conversation'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EnumRouterLink } from '@/constants/paths'

export default function ConversationNew() {
  const navigate = useNavigate()
  const { data: conversations } = useConversations()
  const { mutateAsync: createConversation } = useCreateConversation()

  useEffect(() => {
    if (!conversations) return
    const [one] = conversations
    if (one) {
      // Default redirect to the first item
      navigate(EnumRouterLink.ConversationDetail.replace(':conversationId', one.id))
    }
  }, [navigate, conversations])

  useEffect(() => {
    if (conversations && conversations.length === 0) {
      createConversation({})
    }
  }, [conversations, createConversation])

  return null
}
