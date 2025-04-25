import ChatMessageCard from '@/components/ChatMessageCard'
import ChatInput from '@/components/ChatInput'
import { useConversationDetailById } from '@/hooks/use-conversation'
import LogoCard from '@/components/LogoCard'
import { cn } from '@/lib/utils'
import ScrollContainer from '@/components/ScrollContainer'
import { useParams } from 'react-router-dom'
import { useOllamaLlmModels } from '@/hooks/use-ollama'
import { useEffect } from 'react'
import { useIsSettingOpen, useSettingTab } from '@/hooks/use-config'
import { SettingsTab } from '@/constants/settings'

export default function ConversationDetail() {
  const { conversationId } = useParams()
  const { data: conversationDetail } = useConversationDetailById({ id: conversationId })
  const { messages = [] } = conversationDetail || {}
  const { data: ollamaModels } = useOllamaLlmModels()
  const [, setIsSettingOpen] = useIsSettingOpen()
  const [, setSettingTab] = useSettingTab()

  useEffect(() => {
    if (ollamaModels && ollamaModels.length === 0) {
      setSettingTab(SettingsTab.LocalModels)
      setIsSettingOpen(true)
    }
  }, [ollamaModels, setIsSettingOpen, setSettingTab])

  const hasMessages = messages.length > 0

  // console.log('conversationDetail', conversationDetail)
  if (!conversationDetail || !conversationDetail.conversation) return null

  return (
    <div className={cn('mx-auto flex h-full flex-col', !hasMessages && 'items-center justify-center')}>
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
                    conversation={conversationDetail.conversation}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollContainer>
      )}
      {!hasMessages && (
        <div className="pb-10">
          <LogoCard />
        </div>
      )}
      <div className="w-full px-2 pb-2">
        <ChatInput />
      </div>
    </div>
  )
}
