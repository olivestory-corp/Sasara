import React, { useEffect, useRef, useState } from 'react'
import { Plus, CircleArrowUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStream } from '@/hooks/use-chat'
import { useConversationDetail, useConversationSettings } from '@/hooks/use-conversation'
import { useQueryClient } from '@tanstack/react-query'
import { createNewDefaultConversationParams, createNewMessage } from '@/services/helper'
import { IConversationDetail } from '@/types'
import { createConversation, updateConversationTitle } from '@/services'
import { toast } from 'sonner'
import { AutosizeTextarea, AutosizeTextAreaRef } from '@/components/AutosizeTextarea'
import { useOpenInspectorStatus } from '@/hooks/useOpenStatus'
import { useTranslation } from 'react-i18next'
import { useScrollToBottom } from '@/hooks/use-scroll'
import { useConfig } from '@/hooks/use-config'
import { useUpgradeAlert, useIsPremium } from '@/hooks/use-subscription'

interface ChatInputProps {
  isLoading?: boolean
}

export default function ChatInput({ isLoading }: ChatInputProps) {
  const { t } = useTranslation('translation')
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const { data: conversationDetail } = useConversationDetail()
  const settings = useConversationSettings()
  const { conversation } = conversationDetail || {}
  const [isPending, setIsPending] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [, setOpenInspector] = useOpenInspectorStatus()
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

      // Wait for disabled state to recover before focusing
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

    if (!_conversation) {
      return
    }

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
      // If failed, cannot continue conversation
      const result = await settings.reset()
      if (!result) return
      const data = createNewDefaultConversationParams(trimmedMessage, _conversation, settings)
      // Build temporary message
      setMessage('')

      console.log('Building temporary Q&A', data.conversation_id)
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
        console.log('Old Q&A message body', oldMessages)
        console.log('New Q&A message body', newMessages)
        return {
          ...oldConversationDetail,
          messages: newMessages,
        }
      })
      await mutateChatStream(data)
    } catch (error) {
      toast.error(t('chat.failedToRespondReason', { message: (error as Error).message }))
      setIsPending(false)
      // Wait for disabled state to recover before focusing
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
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-lg">
      <div className="absolute inset-0 h-full w-full animate-rotate rounded-full bg-[conic-gradient(theme('colors.primary.DEFAULT')_20deg,transparent_60deg)]"></div>
      <div className="relative z-20 m-[0.6px] rounded-lg border border-border bg-background p-2">
        <AutosizeTextarea
          ref={textAreaRef}
          rows={1}
          placeholder={t('chat.placeholder')}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          disabled={isLoading || isPending}
          maxHeight={24 * 6}
          className="text-foreground"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Reference panel */}
            <Button
              variant="ghost"
              className="space-x-1 text-muted-foreground"
              disabled={isLoading || isPending}
              onClick={() => setOpenInspector((old) => !old)}
            >
              <Plus className="h-4 w-4" />
              <span>{t('chat.source')}</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {/* Send button */}
            {isLoading || isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CircleArrowUp
                className="h-8 w-8 cursor-pointer pr-2 text-primary/80 hover:text-primary"
                onClick={handleSend}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
