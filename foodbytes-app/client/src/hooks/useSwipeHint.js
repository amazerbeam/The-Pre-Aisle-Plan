import { useCallback, useState } from 'react'
import { SWIPE_HINT_STORAGE_KEY } from '../constants/mealPlanUi'

const readSeen = () => {
  try { return window.localStorage.getItem(SWIPE_HINT_STORAGE_KEY) === '1' } catch { return false }
}

/**
 * First-run swipe hint for mobile meal cards. Shown until the user completes a real swipe;
 * viewing, tapping or changing day never dismisses it. Per device. If storage is blocked
 * the hint simply shows each session.
 */
export default function useSwipeHint() {
  const [showHint, setShowHint] = useState(readSeen() === false)
  const markSeen = useCallback(() => {
    try { window.localStorage.setItem(SWIPE_HINT_STORAGE_KEY, '1') } catch { /* storage blocked: hint returns next session */ }
    setShowHint(false)
  }, [])
  return { showHint, markSeen }
}
