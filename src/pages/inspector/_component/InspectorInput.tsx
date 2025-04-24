import { cn } from '@/lib/utils'
import { AutosizeTextarea, AutosizeTextAreaRef } from '@/components/AutosizeTextarea'
import InspectorSettings from './InspectorSettings'
import { useCurrentConversationByNote } from '@/hooks/use-note'
import InspectorSource from './InspectorSource'
// import ChatInput from '@/components/ChatInput'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'

import { useChatStream } from '@/hooks/use-chat'
import { useConversationDetailById, useConversationSettingsById } from '@/hooks/use-conversation'
import { createNewDefaultConversationParams, createNewMessage } from '@/services/helper'
import { IConversationDetail } from '@/types'
import { createConversation, updateConversationTitle } from '@/services'
import { useScrollToBottom } from '@/hooks/use-scroll'
import { useConfig } from '@/hooks/use-config'

import { useUpgradeAlert, useIsPremium } from '@/hooks/use-subscription'
import { toast } from 'sonner'

// TODO: Unify conversation input logic
export default function InspectorInput({ className }: { className?: string }) {
  const { t } = useTranslation('translation')
  const currentConversation = useCurrentConversationByNote()

  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const { data: conversationDetail } = useConversationDetailById({ id: currentConversation?.id })
  const settings = useConversationSettingsById({ id: currentConversation?.id })
  const { conversation } = conversationDetail || {}
  const [isPending, setIsPending] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const { setAutoScroll } = useScrollToBottom()
  const textAreaRef = useRef<AutosizeTextAreaRef | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [, setUpgradeAlert] = useUpgradeAlert()
  const [config] = useConfig()
  const isCloudMode = !config.privateMode
  const isPremium = useIsPremium()

  useEffect(() => {
    textAreaRef.current?.textArea?.focus()
  }, [conversationDetail?.conversation.id])

  const { mutateAsync: mutateChatStream } = useChatStream({
    onSending: (data) => {
      setAutoScroll(true)

      queryClient.setQueryData(
        ['conversation', conversation?.id],
        (oldConversationDetail: typeof conversationDetail) => {
          const oldMessages = oldConversationDetail?.messages || []
          const messages = oldMessages.slice(0, -2)
          // const lastTempUserMessage = oldMessages.at(-2)
          // const lastTempBotMessage = oldMessages.at(-1)
          const newMessages = [...messages, data.userMessage, data.botMessage]
          return {
            ...oldConversationDetail,
            messages: newMessages,
          }
        },
      )
    },
    onAnswer: (botMessage) => {
      queryClient.setQueryData(
        ['conversation', conversation?.id],
        (oldConversationDetail: typeof conversationDetail) => {
          const oldMessages = oldConversationDetail?.messages || []
          const newMessages = oldMessages.map((m) => {
            if (m.id === botMessage.id) {
              return botMessage
            }
            return m
          })
          return {
            ...oldConversationDetail,
            messages: newMessages,
          }
        },
      )
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['conversation', conversation?.id],
        (oldConversationDetail: typeof conversationDetail) => {
          const oldMessages = oldConversationDetail?.messages || []
          const newMessages = oldMessages.map((m) => {
            if (m.id === data.botMessage.id) {
              return data.botMessage
            }
            return m
          })
          return {
            ...oldConversationDetail,
            messages: newMessages,
          }
        },
      )
      setIsPending(false)

      // Wait for focus to be restored after disabled state
      setTimeout(() => {
        textAreaRef.current?.textArea?.focus()
      }, 300)

      if (!conversation?.title && !isGeneratingTitle) {
        //   console.log(`Title judgment: ${JSON.stringify(conversation)} |\n ${isGeneratingTitle}`)
        setIsGeneratingTitle(true)
        updateConversationTitle(data.conversation_id, data.userMessage.content).then(() => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
          queryClient.invalidateQueries({ queryKey: ['conversation', data.conversation_id] })
          setIsGeneratingTitle(false)
        })
      }
    },
    onError: (data) => {
      console.log('[renderer] ChatInput chatStream onError', data)
      queryClient.setQueryData(
        ['conversation', conversation?.id],
        (oldConversationDetail: typeof conversationDetail) => {
          const oldMessages = oldConversationDetail?.messages || []
          const newMessages = oldMessages.map((m) => {
            if (m.id === data.botMessage.id) {
              return data.botMessage
            }
            return m
          })
          return {
            ...oldConversationDetail,
            messages: newMessages,
          }
        },
      )
      setIsPending(false)

      // Update free chat count
      if (!isPremium && isCloudMode) {
        setUpgradeAlert(true)
      }
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleSend = async () => {
    if (isPending) return

    const _conversation =
      conversation ||
      (await createConversation().then((res) => {
        queryClient.setQueryData(['conversation', res.conversation.id], res)
        return res.conversation
      }))

    if (!_conversation) return

    const trimmedMessage = message.trim()
    if (!trimmedMessage) return
    if (!isPremium) {
      if (isCloudMode) {
        setUpgradeAlert(true)
        return
      }
    }

    setIsPending(true)

    // Send request
    try {
      // If failed, cannot continue the conversation
      const result = await settings.reset()
      if (!result) return
      const data = createNewDefaultConversationParams(trimmedMessage, _conversation, settings)
      // Build temporary message
      setMessage('')
      queryClient.setQueryData(['conversation', data.conversation_id], (oldConversationDetail: IConversationDetail) => {
        const userMessage = createNewMessage({
          role: 'user',
          status: 'success',
          conversation_id: data.conversation_id,
          content: data.question,
        })
        const botMessage = createNewMessage({
          role: 'chatbot',
          status: 'pending',
          conversation_id: data.conversation_id,
          content: '',
        })

        const oldMessages = oldConversationDetail?.messages || []
        const newMessages = [...oldMessages, userMessage, botMessage]
        return {
          ...oldConversationDetail,
          messages: newMessages,
        }
      })
      await mutateChatStream(data)
    } catch (error) {
      toast.error(t('chat.failedToRespondReason', { message: (error as Error).message }))
      setIsPending(false)
      // Wait for focus to be restored after disabled state
      setTimeout(() => {
        textAreaRef.current?.textArea?.focus()
      }, 300)

      queryClient.invalidateQueries({ queryKey: ['conversation', _conversation.id] })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-md bg-muted p-2', className)}>
      <InspectorSource />
      <AutosizeTextarea
        ref={textAreaRef}
        rows={1}
        placeholder={t('chat.placeholder')}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={isPending}
        maxHeight={24 * 6}
        className="text-foreground"
      />
      <InspectorSettings />
    </div>
  )
}
