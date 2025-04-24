import { chatStream } from '@/services/chat'
import { useMutation } from '@tanstack/react-query'
import { IConversation, IMessage } from '@/types'

type IStreamEvent = 'sending' | 'pending' | 'success' | 'error'
interface IStreamData {
  userMessage: IMessage
  botMessage: IMessage
  conversation_id: IConversation['id']
}
interface UseChatStreamProps {
  onSending?: (data: IStreamData) => void
  onAnswer?: (data: IMessage) => void
  onSuccess?: (data: IStreamData) => void
  onError?: (data: IStreamData) => void
}
export function useChatStream({ onSending, onAnswer, onSuccess, onError }: UseChatStreamProps = {}) {
  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof chatStream>[0]) => {
      return chatStream(data, {
        onmessage: (msg) => {
          const event = msg.event as IStreamEvent
          if (event === 'sending') {
            const data = JSON.parse(msg.data) as IStreamData
            onSending?.(data)
          } else if (event === 'pending') {
            const data = JSON.parse(msg.data) as IMessage
            onAnswer?.(data)
          } else if (event === 'success') {
            const data = JSON.parse(msg.data) as IStreamData
            onSuccess?.(data)
          } else {
            const data = JSON.parse(msg.data) as IStreamData
            onError?.(data)
          }
        },
        onerror: (error) => {
          throw error
        },
      })
    },
  })

  return mutation
}
