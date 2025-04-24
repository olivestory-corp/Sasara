import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Pin, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateKnowledgeItem } from '@/services'
import { IKnowledge } from '@/types'
import { EnumRouterLink } from '@/constants/paths'
import { findNextId } from '@/services/helper'
import { useKnowledgeItems, useDeleteKnowledgeItem } from '@/hooks/use-knowledge'
import { useTranslation } from 'react-i18next'

export default function KnowledgeList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: knowledgeItems } = useKnowledgeItems()
  const { mutateAsync: mutateUpdateKnowledgeItem } = useMutation({
    mutationFn: (knowledgeItem: IKnowledge) => updateKnowledgeItem(knowledgeItem.id, knowledgeItem),
  })
  const { mutateAsync: mutateDeleteKnowledgeItem } = useDeleteKnowledgeItem()

  const handlePinKnowledge = async (knowledgeItem: IKnowledge) => {
    await mutateUpdateKnowledgeItem({ ...knowledgeItem, isPin: !knowledgeItem.isPin })
    queryClient.invalidateQueries({ queryKey: ['knowledgeItems'] })
  }

  const handleDeleteKnowledge = async (knowledgeItem: IKnowledge) => {
    await mutateDeleteKnowledgeItem(knowledgeItem.id)

    const nextKnowledgeId = findNextId<IKnowledge>(knowledgeItems || [], knowledgeItem.id)
    if (nextKnowledgeId) {
      navigate(EnumRouterLink.KnowledgeDetail.replace(':knowledgeId', nextKnowledgeId))
    } else {
      navigate(EnumRouterLink.KnowledgeNew)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {knowledgeItems?.map((knowledgeItem) => (
        <ContextMenu key={knowledgeItem.id}>
          <ContextMenuTrigger>
            <NavLink to={`/knowledge/${knowledgeItem.id}`}>
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
                        'text-headline line-clamp-1 w-full text-base font-medium text-headline-sidebar',
                        isActive ? 'text-headline-sidebar-selected' : '',
                      )}
                    >
                      {knowledgeItem.title || t('sidebar.newKnowledge')}
                    </div>
                    <div className="line-clamp-1 w-full pt-1 text-sm">
                      {knowledgeItem.description || t('sidebar.newKnowledgeDescription')}
                    </div>
                    <div className="flex items-center pt-2 text-xs font-light">
                      {knowledgeItem.isPin && <Pin className="mr-1 h-3 w-3" />}
                      {new Date(knowledgeItem.timeStamp * 1000).toLocaleDateString()}
                    </div>
                  </div>
                )
              }}
            </NavLink>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem className="flex items-center gap-2" onClick={() => handlePinKnowledge(knowledgeItem)}>
              <Pin className="h-4 w-4" />
              {knowledgeItem.isPin ? t('sidebar.unpin') : t('sidebar.pin')}
            </ContextMenuItem>
            <ContextMenuItem className="flex items-center gap-2" onClick={() => handleDeleteKnowledge(knowledgeItem)}>
              <Trash className="h-4 w-4" />
              {t('sidebar.delete')}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  )
}
