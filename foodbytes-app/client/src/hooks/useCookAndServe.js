import { useEffect, useState } from 'react'
import { cookServeSchedule, shouldServe } from '../utils/cookServe'
import { readLastSeenEatenAt, writeLastSeenEatenAt } from '../utils/pipSeenStore'
import { prefersReducedMotion } from '../utils/reducedMotion'

/**
 * MPP-18: Pip's cook-and-serve scene on /pet. When the viewer's latest eaten
 * breakfast/lunch/dinner (moodInfo.lastLoggedAt, their own ticks only — MPP-33) is newer
 * than the one this browser last played, it marks it seen at once (AC 4: a reload never
 * replays it) and steps through the phases on timers.
 *
 * Only the latest meal is compared, so several new ones give one scene (AC 2). A meal
 * ticked mid-scene is picked up when the scene ends.
 *
 * @param {{ userId: number|null, lastLoggedAt: number|null, lastLoggedType: string|null }} input
 * @returns {{ phase: string, mealType: string } | null}
 */
export function useCookAndServe({ userId, lastLoggedAt, lastLoggedType }) {
  const [run, setRun] = useState(null)

  // Start only between scenes, so a rerender mid-scene (clock tick, refetch) can't restart it.
  useEffect(() => {
    if (run || userId == null || !lastLoggedType) return
    if (!shouldServe(lastLoggedAt, readLastSeenEatenAt(userId))) return
    writeLastSeenEatenAt(userId, lastLoggedAt)
    setRun({ mealType: lastLoggedType, steps: cookServeSchedule(prefersReducedMotion()), index: 0 })
  }, [run, userId, lastLoggedAt, lastLoggedType])

  // One timer per phase; cleared if /pet unmounts mid-scene.
  useEffect(() => {
    if (!run) return undefined
    const timerId = setTimeout(() => {
      setRun(current => (current && current.index + 1 < current.steps.length
        ? { ...current, index: current.index + 1 }
        : null))
    }, run.steps[run.index].ms)
    return () => clearTimeout(timerId)
  }, [run])

  return run ? { phase: run.steps[run.index].phase, mealType: run.mealType } : null
}

export default useCookAndServe
