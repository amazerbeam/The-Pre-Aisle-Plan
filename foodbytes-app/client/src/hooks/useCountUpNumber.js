import { useEffect, useState } from 'react'
import { COUNT_UP_DELAY_MS, GAIN_PILL_MS, GAIN_PILL_REDUCED_MS, GOLD_HOLD_MS } from '../constants/petSprinkles'
import { countUpDuration } from '../utils/sprinkleHistory'

const IDLE = { value: null, phase: 'idle' }

/**
 * MPP-42 AC 15 / 18: animates one count-up run inside SprinklesChip, so frames re-render the chip
 * alone. waiting (old number, COUNT_UP_DELAY_MS) → counting (ease-out cubic) → done (gold holds while
 * the pill finishes) → idle (value null: show the live balance). Reduced motion: done at once, idle
 * after GAIN_PILL_REDUCED_MS. Every timer and frame is cancelled in cleanup.
 *
 * @param {{ run: { id: number, from: number, to: number, gain: number }|null, reduced: boolean }} input
 * @returns {{ value: number|null, phase: 'idle'|'waiting'|'counting'|'done' }}
 */
export function useCountUpNumber({ run, reduced }) {
  const [state, setState] = useState(IDLE)

  useEffect(() => {
    if (!run) {
      setState(IDLE)
      return undefined
    }
    if (reduced) {
      setState({ value: run.to, phase: 'done' })
      const timerId = setTimeout(() => setState(IDLE), GAIN_PILL_REDUCED_MS)
      return () => clearTimeout(timerId)
    }
    setState({ value: run.from, phase: 'waiting' })
    const duration = countUpDuration(run.gain)
    let frame = null
    let doneTimer = null
    const startTimer = setTimeout(() => {
      const startedAt = performance.now()
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        setState({ value: Math.round(run.from + run.gain * eased), phase: progress < 1 ? 'counting' : 'done' })
        if (progress < 1) {
          frame = requestAnimationFrame(step)
        } else {
          doneTimer = setTimeout(() => setState(IDLE), Math.max(GAIN_PILL_MS - duration, GOLD_HOLD_MS))
        }
      }
      frame = requestAnimationFrame(step)
    }, COUNT_UP_DELAY_MS)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(doneTimer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [run, reduced])

  return state
}

export default useCountUpNumber
