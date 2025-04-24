import { useState } from 'react'
import { useScrollToBottom } from '@/hooks/use-scroll'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ScrollContainer({ children }: { children: React.ReactNode }) {
  const { setAutoScroll } = useScrollToBottom()
  const [hitBottom, setHitBottom] = useState(false)
  const onBodyScroll = (e: HTMLDivElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 100
    setHitBottom(isTouchBottom)
  }

  return (
    <div className="h-full w-full flex-1 transform-gpu overflow-hidden py-4">
      <ScrollArea
        className="h-full"
        viewportProps={{
          id: '__scroll_container',
          onScroll: (e) => onBodyScroll(e.currentTarget),
          onWheel: (e) => setAutoScroll(hitBottom && e.deltaY > 0),
          onTouchStart: () => {
            setAutoScroll(false)
          },
        }}
      >
        {children}
      </ScrollArea>
    </div>
  )
}
