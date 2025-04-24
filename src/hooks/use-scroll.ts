import { useLayoutEffect } from 'react'
import { atom, useAtom } from 'jotai'

export const autoScrollAtom = atom(true)

export function useScrollToBottom() {
  const [autoScroll, setAutoScroll] = useAtom(autoScrollAtom)

  const scrollToBottom = () => {
    const dom = document.querySelector('#__scroll_container')
    if (dom) {
      setTimeout(() => {
        dom.scrollTop = dom.scrollHeight
        // dom.scrollTo({
        //   top: dom.scrollHeight,
        //   behavior: "smooth",
        // })
      }, 1)
    }
  }

  // auto scroll
  useLayoutEffect(() => {
    autoScroll && scrollToBottom()
  })

  return {
    scrollToBottom,
    autoScroll,
    setAutoScroll,
  }
}
