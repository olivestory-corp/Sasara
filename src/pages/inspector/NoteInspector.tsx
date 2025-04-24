import { useCurrentConversationDetailByNote, useCurrentNote } from '@/hooks/use-note'
import ScrollContainer from '@/components/ScrollContainer'
import ChatMessageCard from '@/components/ChatMessageCard'
import InspectorChatHistory from './_component/InspectorChatHistory'
import { useEffect } from 'react'
import { useCreateConversation, useConversationsByNoteId } from '@/hooks/use-conversation'
import { useSearchParams, useNavigate } from 'react-router-dom'
import InspectorInput from './_component/InspectorInput'

export default function NoteInspector() {
  const { data: currentNote } = useCurrentNote()
  const { data: conversations } = useConversationsByNoteId({ noteId: currentNote?.id })
  const { data: currentConversationDetail } = useCurrentConversationDetailByNote()
  const messages = currentConversationDetail?.messages
  const hasMessages = messages && messages.length > 0
  const { mutateAsync: createConversation } = useCreateConversation()
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get('conversationId')
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentNote) return
    if (conversations) {
      if (conversations.length === 0) {
        console.log('createConversation==========')
        createConversation({ note_ids: [currentNote.id] })
      } else if (!conversationId) {
        const conversation = conversations.find((conversation) => conversation.note_ids.includes(currentNote.id))
        if (conversation) {
          console.log('navigate==========', conversation)
          navigate(`?conversationId=${conversation.id}`)
        }
      }
    }
  }, [conversations, currentNote, createConversation, conversationId, navigate])

  return (
    <div className="flex h-full flex-col p-4">
      {hasMessages && (
        <ScrollContainer>
          <div className="mx-auto max-w-prose flex-1 px-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                {message.role === 'user' && (
                  <div className="my-2 pt-4 text-xl font-semibold text-headline-main">{message.content}</div>
                )}
                {message.role !== 'user' && (
                  <ChatMessageCard
                    data={message}
                    userMessage={messages[index - 1]}
                    conversation={currentConversationDetail.conversation}
                    showDelete={false}
                    showAdd={true}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollContainer>
      )}

      <InspectorInput />
      <InspectorChatHistory />
    </div>
  )
}
