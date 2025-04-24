import { useNavigate } from 'react-router-dom'
import {
  LucideMessageCircle,
  LucideNotebookPen,
  LucideListFilter,
  LucidePlus,
  LucideLibraryBig,
  LucideSearch,
} from 'lucide-react'
import { useCreateNote } from '@/hooks/use-note'
import NoteList from '@/pages/sidebar/NoteList'
import ConversationList from '@/pages/sidebar/ConversationList'
import KnowledgeList from '@/pages/sidebar/KnowledgeList'
import { EnumRouterLink } from '@/constants/paths'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarInput,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useCreateConversation } from '@/hooks/use-conversation'
import NavUser from './NavUser'
import { useRouterField } from '@/hooks/use-router-field'
import { useSearchConfig, useSortConfig } from '@/hooks/use-config'
import { IBaseOption, ISortBy, ISortOrder } from '@/types'
import { SORT_ORDER_LIST } from '@/constants/sort'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@/components/ui/scroll-area'
export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden border-none pb-1 pr-1 pt-11 [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      <SidebarFirst />
      <SidebarSecond />
    </Sidebar>
  )
}

function SidebarFirst() {
  const { t } = useTranslation()

  const NAV_ITEMS = useMemo(
    () => [
      {
        id: 'conversation',
        path: EnumRouterLink.ConversationNew,
        title: t('sidebar.conversation'),
        icon: <LucideMessageCircle className="h-5 w-5" strokeWidth={1.8} />,
        active: false,
      },
      {
        id: 'note',
        path: EnumRouterLink.NoteNew,
        title: t('sidebar.note'),
        icon: <LucideNotebookPen className="h-5 w-5" strokeWidth={1.8} />,
        active: false,
      },
      {
        id: 'knowledge',
        path: EnumRouterLink.KnowledgeNew,
        title: t('sidebar.knowledge'),
        icon: <LucideLibraryBig className="h-5 w-5" strokeWidth={1.8} />,
        active: false,
      },
    ],
    [t],
  )

  const routerField = useRouterField()

  const navItems = useMemo(() => {
    return NAV_ITEMS.map((item) => ({
      ...item,
      active: routerField[item.id as keyof typeof routerField] as boolean,
    }))
  }, [NAV_ITEMS, routerField])
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="none" className="flex !w-[calc(var(--sidebar-width-icon)_+_1px)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    onClick={() => navigate(item.path)}
                    isActive={item.active}
                    className={cn(
                      'px-2.5 text-titlebar-foreground hover:bg-titlebar-background-selected md:px-2',
                      item.active ? 'bg-titlebar-background-selected text-titlebar-foreground-selected' : '',
                    )}
                  >
                    {item.icon}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0 px-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarSecond() {
  const { t } = useTranslation()
  const routerField = useRouterField()
  const { mutateAsync: handleCreateNote } = useCreateNote()
  const { mutateAsync: handleCreateConversation } = useCreateConversation()
  const navigate = useNavigate()
  const [config, setConfig] = useSortConfig()

  const sortBy = config.sortByField[routerField.activeField as keyof typeof config.sortByField]
  const setSortBy = (value: ISortBy | string) => {
    setConfig({ ...config, sortByField: { ...config.sortByField, [routerField.activeField]: value } })
  }
  const sortOrder = config.sortOrderField[routerField.activeField as keyof typeof config.sortOrderField]
  const setSortOrder = (value: ISortOrder | string) => {
    setConfig({ ...config, sortOrderField: { ...config.sortOrderField, [routerField.activeField]: value } })
  }

  // search
  const [searchConfig, setSearchConfig] = useSearchConfig()
  const setSearchText = (value: string) => {
    console.log('[renderer] -> setSearchText', value)
    setSearchConfig({
      ...searchConfig,
      searchByField: { ...searchConfig.searchByField, [routerField.activeField]: value },
    })
  }
  const [message, setMessage] = useState('')

  useEffect(() => {
    const searchText = searchConfig.searchByField[routerField.activeField as keyof typeof searchConfig.searchByField]
    setMessage(searchText)
  }, [routerField.activeField, searchConfig])

  const handleAdd = async () => {
    if (routerField.note) {
      const newNote = await handleCreateNote()
      navigate(EnumRouterLink.NoteDetail.replace(':noteId', newNote.id))
    } else if (routerField.knowledge) {
      navigate(EnumRouterLink.KnowledgeNew)
    } else if (routerField.conversation) {
      const data = await handleCreateConversation({})
      const newConversation = data.conversation
      navigate(EnumRouterLink.ConversationDetail.replace(':conversationId', newConversation.id))
    }
  }

  const SORT_BY_LIST: IBaseOption[] = [
    { id: 'updated_at', name: t('sidebar.updatedAt') },
    { id: 'created_at', name: t('sidebar.createdAt') },
    { id: 'name', name: t('sidebar.name') },
  ]

  return (
    <Sidebar collapsible="none" className="hidden flex-1 overflow-hidden rounded-lg bg-sidebar-background md:flex">
      <SidebarHeader className="gap-3.5 p-4 text-titlebar-foreground-selected">
        <div className="flex w-full items-center justify-between">
          <span className="text-xl font-medium">
            {routerField.note && t('sidebar.note')}
            {routerField.conversation && t('sidebar.conversation')}
            {routerField.knowledge && t('sidebar.knowledge')}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <LucideListFilter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{t('sidebar.sortBy')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                {/* <DropdownMenuRadioItem value="modified_at">Modified at</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="created_at">Created at</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem> */}
                {SORT_BY_LIST.map((item) => (
                  <DropdownMenuRadioItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sortOrder === 'desc'}
                onCheckedChange={(value) => setSortOrder(value ? 'desc' : 'asc')}
              >
                {SORT_ORDER_LIST.find((item) => item.id === sortOrder)?.name}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative">
          <SidebarInput
            key={routerField.activeField || 'NULL'}
            placeholder={t('sidebar.searchPlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchText(message)
              }
            }}
            className="focus-visible:ring-10 border-border bg-sidebar-background text-sidebar-foreground placeholder:text-sidebar-foreground"
          />
          <LucideSearch
            className="text-second-sidebar-foreground absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer hover:text-titlebar-foreground"
            onClick={() => setSearchText(message)}
          />
        </div>
      </SidebarHeader>
      <ScrollArea className="h-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              {routerField.conversation && <ConversationList />}
              {routerField.note && <NoteList />}
              {routerField.knowledge && <KnowledgeList />}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter>
        <Button onClick={handleAdd}>
          <LucidePlus className="h-6 w-6" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
