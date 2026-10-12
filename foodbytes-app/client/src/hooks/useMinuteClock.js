import { useEffect, useState } from 'react'
import { PET_CLOCK_TICK_MS } from '../constants/pet'

/**
 * MPP-14: the current time, re-read every `tickMs` and whenever the tab becomes
 * visible again, so the pet's mood changes as meal times pass without a reload.
 * Background tabs throttle intervals; the visibility re-read covers that.
 */
export function useMinuteClock(tickMs = PET_CLOCK_TICK_MS) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick()
    }
    const intervalId = setInterval(tick, tickMs)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [tickMs])

  return now
}

export default useMinuteClock
