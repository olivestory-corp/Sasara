import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useConversationsByNoteId } from '@/hooks/use-conversation'
import { useCurrentConversationByNote } from '@/hooks/use-note'
import { IConversation, INote } from '@/types'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { EnumRouterLink } from '@/constants/paths'

export default function InspectorChatHistory() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { noteId = '' } = useParams()
  // Only show chat history for the current note
  const { data: conversations } = useConversationsByNoteId({ noteId: noteId as INote['id'] })
  const currentConversation = useCurrentConversationByNote()

  const handleClickConversation = (conversationId: IConversation['id']) => {
    navigate(EnumRouterLink.NoteDetail.replace(':noteId', noteId) + `?conversationId=${conversationId}`)
  }

  return (
    <Accordion type="multiple">
      <AccordionItem value="previous-chats">
        <AccordionTrigger>
          <span className="text-sm text-muted-foreground">{t('inspector.previousChats')}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid w-full gap-2">
            {conversations?.map((conversation) => (
              <Button
                key={conversation.id}
                variant="outline"
                className={cn(
                  'h-8 w-full overflow-hidden px-2',
                  conversation.id === currentConversation?.id && 'bg-accent text-accent-foreground',
                )}
                onClick={() => handleClickConversation(conversation.id)}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="truncate font-normal" title={conversation.title}>
                    {conversation.title || t('sidebar.newChat')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.create_at * 1000).toLocaleDateString()}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
