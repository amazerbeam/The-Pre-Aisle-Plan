import { useEffect, useState } from 'react'
import { PIP_DEFAULT_FORM, PIP_GROWTH_PHASES } from '../constants/pipGrowth'
import { growthBubble, growthChange, growthSchedule, growthView } from '../utils/pipGrowth'
import { readSeenGrowth, writeSeenGrowth } from '../utils/pipGrowthSeenStore'
import { prefersReducedMotion } from '../utils/reducedMotion'

const NO_GROWTH = { displayForm: PIP_DEFAULT_FORM, barPct: 0, barLabel: null, phase: PIP_GROWTH_PHASES.IDLE, bubble: null }

/**
 * MPP-31 AC 5 / AC 8 / AC 9: what Pip and his level bar show on /pet. When the server's growth
 * differs from what this browser last showed this user, it plays the change once: the bar runs to
 * its edge, Pip evolves (pulse) or de-evolves (shrink), then the new bar settles with a bubble.
 * A first visit plays nothing. The marker is written when the closing step starts, so leaving
 * mid-sequence replays it next time.
 *
 * MPP-28: `hold` (true while the cook scene or an announcement speaks) neither starts nor advances
 * a run; the current step restarts in full when it lifts, so a stage change waits its turn (AC 2).
 *
 * @param {{ userId: number|null, growth: Object|null, petName: string|null, hold?: boolean }} input
 * @returns {{ displayForm: number, barPct: number, barLabel: string|null, phase: string, bubble: string|null }}
 */
export function usePipGrowth({ userId, growth, petName, hold = false }) {
  const [run, setRun] = useState(null) // { change, seen, growth, steps, index }

  // Read during render too, so the frame before the run starts already shows the old state.
  const seen = !run && userId != null && growth ? readSeenGrowth(userId) : null
  const pending = seen ? growthChange(seen, growth) : null

  // Start only between runs, so a rerender (clock tick, refetch) can't restart one.
  useEffect(() => {
    if (run || hold || userId == null || !growth) return
    const last = readSeenGrowth(userId)
    const change = growthChange(last, growth)
    if (!change) {
      if (!last || last.points !== growth.points || last.lastScoredDate !== growth.lastScoredDate) {
        writeSeenGrowth(userId, growth)
      }
      return
    }
    setRun({ change, seen: last, growth, steps: growthSchedule(change, prefersReducedMotion()), index: 0 })
  }, [run, hold, userId, growth])

  // Mark seen as the closing step begins; one timer per step, cleared if /pet unmounts.
  useEffect(() => {
    if (!run || hold) return undefined
    const step = run.steps[run.index]
    if (step.phase === PIP_GROWTH_PHASES.REVEALED) writeSeenGrowth(userId, run.growth)
    const timerId = setTimeout(() => {
      setRun(current => (current && current.index + 1 < current.steps.length
        ? { ...current, index: current.index + 1 }
        : null))
    }, step.ms)
    return () => clearTimeout(timerId)
  }, [run, hold, userId])

  if (!growth) return NO_GROWTH

  if (run) {
    const { phase } = run.steps[run.index]
    const view = growthView(phase, run.seen, run.growth)
    return {
      displayForm: view.form,
      barPct: view.pct,
      barLabel: view.label,
      phase,
      bubble: growthBubble({ change: run.change, phase, petName, seen: run.seen, growth: run.growth })
    }
  }

  const view = growthView(pending ? null : PIP_GROWTH_PHASES.IDLE, seen, growth)
  return { displayForm: view.form, barPct: view.pct, barLabel: view.label, phase: PIP_GROWTH_PHASES.IDLE, bubble: null }
}

export default usePipGrowth
