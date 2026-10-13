import { useEffect, useRef, useState } from 'react'

/**
 * MPP-19 AC 3: open/close for a full-card overlay inside Pip's room (the fridge; MPP-23's
 * cabinet can reuse it). Tab is trapped in the panel and Escape only closes from inside it. Opening moves focus to the panel's first button (its close
 * button); Escape or close() shuts it and hands focus back to the trigger.
 *
 * Focus returns in the effect after the closing render, by which point the room behind
 * is no longer inert and the trigger can take focus.
 *
 * @returns {{ isOpen: boolean, open: () => void, close: () => void, triggerRef: object, panelRef: object }}
 */
export function useRoomOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) triggerRef.current?.focus()
      wasOpenRef.current = false
      return undefined
    }
    wasOpenRef.current = true
    panelRef.current?.querySelector('button')?.focus()
    const onKeyDown = (event) => {
      const panel = panelRef.current
      if (event.defaultPrevented || !panel) return
      if (event.key === 'Escape') {
        if (panel.contains(event.target) || event.target === document.body) setIsOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      // Trap Tab inside the panel (aria-modal); the panel itself (tabIndex -1) catches lost focus.
      const items = [...panel.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      const first = items[0] ?? panel
      const last = items[items.length - 1] ?? panel
      if (!panel.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    triggerRef,
    panelRef
  }
}

export default useRoomOverlay
