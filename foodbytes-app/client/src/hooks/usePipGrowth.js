import { useEffect, useState } from 'react'
import { HEAD_BAR_GAIN_MS, PIP_DEFAULT_FORM, PIP_GROWTH_PHASES } from '../constants/pipGrowth'
import { growthBubble, growthChange, growthGain, growthSchedule, growthView, lineGrowth } from '../utils/pipGrowth'
import { readSeenGrowth, writeSeenGrowth } from '../utils/pipGrowthSeenStore'
import { lineFormCount } from '../components/pet/pip/lineForms'
import { prefersReducedMotion } from '../utils/reducedMotion'

const NO_GROWTH = { displayForm: PIP_DEFAULT_FORM, barPct: 0, barLabel: null, phase: PIP_GROWTH_PHASES.IDLE, bubble: null, gain: null }

// Each pop gets a fresh id, so its <g> remounts and the CSS animation replays even for a repeat value.
let gainSeq = 0

/**
 * MPP-31 AC 5 / AC 8 / AC 9: what Pip and his level bar show on /pet. When the server's growth
 * differs from what this browser last showed this user, it plays the change once: the bar runs to
 * its edge, Pip evolves (pulse), then the new bar settles with a bubble. Forms never shrink: a drop
 * just settles. A theme switch compares the same line on both sides, so it plays nothing.
 * A first visit plays nothing. The marker is written when the closing step starts, so leaving
 * mid-sequence replays it next time.
 *
 * MPP-28: `hold` (true while the cook scene or an announcement speaks) neither starts nor advances
 * a run; the current step restarts in full when it lifts, so a stage change waits its turn (AC 2).
 *
 * `gain` ({ id, text, gained, count, delayMs }) is the "+3" then "3 / 15" over the bar. It outlives
 * the run (a bar move is only 900 ms) and clears once its animation has played.
 *
 * @param {{ userId: number|null, growth: Object|null, line: string, petName: string|null, hold?: boolean }} input
 *   `growth` is the raw PetGrowthDTO (every line); `line` is the active theme's Pip line.
 * @returns {{ displayForm: number, lastForm: number, barPct: number, barLabel: string|null, phase: string, bubble: string|null, gain: Object|null }}
 */
export function usePipGrowth({ userId, growth, line, petName, hold = false }) {
  const [run, setRun] = useState(null) // { change, line, seen, growth, raw, steps, index }
  const [gain, setGain] = useState(null)

  // Read during render too, so the frame before the run starts already shows the old state.
  const live = lineGrowth(growth, line)
  const lastForm = lineFormCount(line)
  const seen = !run && userId != null && live ? lineGrowth(readSeenGrowth(userId), line) : null
  const pending = seen ? growthChange(seen, live) : null

  // Start only between runs, so a rerender (clock tick, refetch) can't restart one.
  useEffect(() => {
    if (run || hold || userId == null || !growth) return
    const current = lineGrowth(growth, line)
    if (!current) return
    const stored = readSeenGrowth(userId)
    const last = lineGrowth(stored, line)
    const change = growthChange(last, current)
    if (!change) {
      if (!stored || stored.points !== growth.points || stored.lastScoredDate !== growth.lastScoredDate) {
        writeSeenGrowth(userId, growth)
      }
      return
    }
    const steps = growthSchedule(change, prefersReducedMotion())
    const popped = growthGain(last, current, steps)
    setGain(popped && { ...popped, id: ++gainSeq })
    setRun({ change, line, seen: last, growth: current, raw: growth, steps, index: 0 })
  }, [run, hold, userId, growth, line])

  // A hold drops the pop: the run replays the bar when it lifts, the numbers are not replayed.
  useEffect(() => {
    if (hold) {
      setGain(null)
      return undefined
    }
    if (!gain) return undefined
    const timerId = setTimeout(() => setGain(null), gain.delayMs + HEAD_BAR_GAIN_MS)
    return () => clearTimeout(timerId)
  }, [gain, hold])

  // Mark seen as the closing step begins; one timer per step, cleared if /pet unmounts.
  useEffect(() => {
    if (!run || hold) return undefined
    const step = run.steps[run.index]
    if (step.phase === PIP_GROWTH_PHASES.REVEALED) writeSeenGrowth(userId, run.raw)
    const timerId = setTimeout(() => {
      setRun(current => (current && current.index + 1 < current.steps.length
        ? { ...current, index: current.index + 1 }
        : null))
    }, step.ms)
    return () => clearTimeout(timerId)
  }, [run, hold, userId])

  if (!live) return { ...NO_GROWTH, lastForm }

  if (run) {
    const { phase } = run.steps[run.index]
    const view = growthView(phase, run.seen, run.growth, run.line)
    return {
      displayForm: view.form,
      lastForm,
      barPct: view.pct,
      barLabel: view.label,
      phase,
      bubble: growthBubble({ change: run.change, phase, petName, seen: run.seen, growth: run.growth, line: run.line }),
      gain
    }
  }

  const view = growthView(pending ? null : PIP_GROWTH_PHASES.IDLE, seen, live, line)
  return { displayForm: view.form, lastForm, barPct: view.pct, barLabel: view.label, phase: PIP_GROWTH_PHASES.IDLE, bubble: null, gain }
}

export default usePipGrowth
