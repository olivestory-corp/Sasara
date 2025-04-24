import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Pencil, Pin, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateConversation, deleteConversation } from '@/services'
import { IConversation } from '@/types'
import { EnumRouterLink } from '@/constants/paths'
import { useConversations, useUpdateConversationTitle } from '@/hooks/use-conversation'
import { findNextId } from '@/services/helper'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

export default function ConversationList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: conversations } = useConversations()

  const navigate = useNavigate()

  const { mutateAsync: mutatePinConversation } = useMutation({
    mutationFn: (conversation: IConversation) =>
      updateConversation(conversation.id, { ...conversation, is_pin: !conversation.is_pin }),
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const handlePinConversation = async (conversation: IConversation) => {
    mutatePinConversation(conversation)
  }

  const { mutateAsync: mutateDeleteConversation } = useMutation({
    mutationFn: (conversation: IConversation) => deleteConversation(conversation.id),
  })

  const handleDeleteConversation = async (conversation: IConversation) => {
    await mutateDeleteConversation(conversation)
    await queryClient.invalidateQueries({ queryKey: ['conversations'] })

    const nextConversationId = findNextId<IConversation>(conversations || [], conversation.id)
    if (nextConversationId) {
      navigate(EnumRouterLink.ConversationDetail.replace(':conversationId', nextConversationId))
    } else {
      navigate(EnumRouterLink.ConversationNew)
    }
  }

  const { mutateAsync: mutateUpdateConversationTitle } = useUpdateConversationTitle()

  const [showUpdateTitleDialog, setShowUpdateTitleDialog] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const handleUpdateConversationTitle = async () => {
    if (selectedConversation && newTitle.trim()) {
      await mutateUpdateConversationTitle({ conversationId: selectedConversation.id, title: newTitle })
      setShowUpdateTitleDialog(false)
    }
  }

  const openUpdateTitleDialog = (conversation: IConversation) => {
    setSelectedConversation(conversation)
    setNewTitle(conversation.title || '')
    setShowUpdateTitleDialog(true)
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {conversations?.map((conversation) => (
        <ContextMenu key={conversation.id}>
          <ContextMenuTrigger className="w-full">
            <NavLink to={`/conversations/${conversation.id}`}>
              {({ isActive }) => {
                return (
                  <div
                    className={cn(
                      'relative flex w-full flex-col items-start overflow-hidden rounded-md px-3 py-2 hover:bg-sidebar-background-selected hover:text-sidebar-foreground-selected',
                      isActive ? 'bg-sidebar-background-selected text-sidebar-foreground-selected' : '',
                    )}
                  >
                    <div
                      className={cn(
                        'text-headline line-clamp-2 w-full text-base font-medium text-headline-sidebar',
                        isActive ? 'text-headline-sidebar-selected' : '',
                      )}
                    >
                      {conversation.title || t('sidebar.newChat')}
                    </div>
                    <div className="flex items-center pt-2 text-xs font-light">
                      {conversation.is_pin && <Pin className="mr-1 h-3 w-3" />}
                      {new Date(conversation.create_at * 1000).toLocaleDateString()}
                    </div>
                  </div>
                )
              }}
            </NavLink>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {/* update conversation title */}
            <ContextMenuItem className="flex items-center gap-2" onClick={() => openUpdateTitleDialog(conversation)}>
              <Pencil className="h-4 w-4" />
              {t('sidebar.updateTitle')}
            </ContextMenuItem>
            <ContextMenuItem className="flex items-center gap-2" onClick={() => handlePinConversation(conversation)}>
              <Pin className="h-4 w-4" />
              {conversation.is_pin ? t('sidebar.unpin') : t('sidebar.pin')}
            </ContextMenuItem>
            <ContextMenuItem className="flex items-center gap-2" onClick={() => handleDeleteConversation(conversation)}>
              <Trash className="h-4 w-4" />
              {t('sidebar.delete')}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <AlertDialog open={showUpdateTitleDialog} onOpenChange={setShowUpdateTitleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar.updateTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('sidebar.enterNewTitle')}</AlertDialogDescription>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('sidebar.titlePlaceholder')}
              className="mt-2"
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateConversationTitle}>{t('common.save')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
