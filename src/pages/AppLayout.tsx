import AppSidebar from '@/pages/sidebar/AppSidebar'
import { Outlet } from 'react-router-dom'
import { SidebarInset } from '@/components/ui/sidebar'
import { useRouterField } from '@/hooks/use-router-field'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import ChatInspector from '@/pages/inspector/ChatInspector'
import { useOpenInspectorStatus, useOpenNoteInspectorStatus } from '@/hooks/useOpenStatus'
import NoteInspector from '@/pages/inspector/NoteInspector'

export default function AppLayout() {
  const routerField = useRouterField()
  const [isInspectorOpen] = useOpenInspectorStatus()
  const [isNoteInspectorOpen] = useOpenNoteInspectorStatus()
  const isOpen =
    ((routerField.conversationDetail || routerField.conversation) && isInspectorOpen) ||
    (routerField.note && isNoteInspectorOpen)

  return (
    <div className="flex h-full bg-titlebar-background pb-1 pr-1">
      <AppSidebar />
      <SidebarInset className="relative flex flex-row overflow-hidden rounded-lg bg-background-main">
        <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-auto" autoSaveId="appLayout">
          <ResizablePanel defaultSize={isOpen ? 70 : 100}>
            <Outlet />
          </ResizablePanel>
          {isOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} maxSize={60} minSize={30}>
                {(routerField.conversationDetail || routerField.conversation) && <ChatInspector />}
                {routerField.note && <NoteInspector />}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarInset>
    </div>
  )
}
