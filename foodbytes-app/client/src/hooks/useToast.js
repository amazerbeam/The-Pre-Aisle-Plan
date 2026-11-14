import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * One transient toast: { message, canUndo }. A new toast replaces the current one and restarts the timer;
 * the timer is cleared on unmount.
 */
export default function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, canUndo, ms) => {
    clearTimeout(timer.current)
    setToast({ message, canUndo })
    timer.current = setTimeout(() => setToast(null), ms)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { toast, showToast, dismissToast }
}
