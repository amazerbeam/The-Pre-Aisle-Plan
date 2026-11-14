import { useCallback, useState } from 'react'

const HIDE_TICKED_KEY = 'fb.shopping.hideTicked'
const read = () => { try { return localStorage.getItem(HIDE_TICKED_KEY) === '1' } catch { return false } }

/** Per-device "Hide ticked" view preference for the shopping list. Never changes any item. */
export default function useHideTicked() {
  const [hideTicked, setState] = useState(read)
  const setHideTicked = useCallback((next) => {
    setState(next)
    try { localStorage.setItem(HIDE_TICKED_KEY, next ? '1' : '0') } catch { /* view preference only */ }
  }, [])
  return [hideTicked, setHideTicked]
}
