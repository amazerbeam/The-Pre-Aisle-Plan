import {
  PIP_BAR_MOVE_MS, PIP_FORM_NAMES, PIP_FULLY_GROWN_LABEL, PIP_FULLY_GROWN_LINE, PIP_GROWTH_BUBBLE_MS,
  PIP_GROWTH_PHASES, PIP_GROWTH_PHASE_MS, PIP_SLIP_LINE, PIP_SLIP_SCORE
} from '../constants/pipGrowth.js'

const { FILLING, EVOLVING, DRAINING, SHRINKING, REVEALED } = PIP_GROWTH_PHASES

export const GROWTH_CHANGES = { EVOLVE: 'evolve', DEVOLVE: 'devolve', SLIP: 'slip', MOVE: 'move' }

/** AC 7: wilted from the day after a −3 day until the next +3 day (the latest scored day is a slip). */
export const isWilted = (growth) => growth?.lastDayScore === PIP_SLIP_SCORE

/** AC 5: 0–100 for the bar; Basilisk (no bar) is full. */
export function barPct(growth) {
  if (!growth) return 0
  if (growth.barSize == null) return 100
  return Math.round((100 * growth.barCurrent) / growth.barSize)
}

/** AC 5: "Seedling · 6 / 21 → Sprig", or "Fully grown 🌸" at Basilisk. */
export function levelBarLabel(growth) {
  if (!growth) return null
  if (growth.fullyGrown || growth.barSize == null) return PIP_FULLY_GROWN_LABEL
  return `${PIP_FORM_NAMES[growth.form]} · ${growth.barCurrent} / ${growth.barSize} → ${PIP_FORM_NAMES[growth.form + 1]}`
}

/** What changed since this browser last showed Pip; null when nothing to play (or first visit). */
export function growthChange(seen, growth) {
  if (!seen || !growth) return null
  if (growth.form > seen.form) return GROWTH_CHANGES.EVOLVE
  if (growth.form < seen.form) return GROWTH_CHANGES.DEVOLVE
  if (growth.lastScoredDate !== seen.lastScoredDate && growth.lastDayScore === PIP_SLIP_SCORE) return GROWTH_CHANGES.SLIP
  if (growth.points !== seen.points) return GROWTH_CHANGES.MOVE
  return null
}

/** AC 5 / AC 8: the steps to play. Reduced motion keeps only the bubble steps. */
export function growthSchedule(change, reducedMotion) {
  const step = (phase, ms = PIP_GROWTH_PHASE_MS[phase]) => ({ phase, ms })
  const revealed = step(REVEALED, change === GROWTH_CHANGES.MOVE ? PIP_BAR_MOVE_MS : PIP_GROWTH_BUBBLE_MS)
  if (change === GROWTH_CHANGES.EVOLVE) {
    return reducedMotion ? [step(EVOLVING), revealed] : [step(FILLING), step(EVOLVING), revealed]
  }
  if (change === GROWTH_CHANGES.DEVOLVE && !reducedMotion) {
    return [step(DRAINING), step(SHRINKING), revealed]
  }
  return [revealed]
}

/**
 * What Pip and the bar show at a phase. Before the evolve / de-evolve the old form and its bar
 * edge show; the new form's bar starts empty (evolve) or full (de-evolve) and then settles.
 * `phase` null = a change is pending but not started yet: the last-seen state, so the bar
 * animates from where the viewer left it.
 */
export function growthView(phase, seen, growth) {
  const old = seen ?? growth
  switch (phase) {
    case null: return { form: old.form, pct: barPct(old), label: levelBarLabel(old) }
    case FILLING: return { form: old.form, pct: 100, label: levelBarLabel(old) }
    case DRAINING: return { form: old.form, pct: 0, label: levelBarLabel(old) }
    case EVOLVING: return { form: growth.form, pct: 0, label: levelBarLabel(growth) }
    case SHRINKING: return { form: growth.form, pct: 100, label: levelBarLabel(growth) }
    default: return { form: growth.form, pct: barPct(growth), label: levelBarLabel(growth) }
  }
}

export const evolvingLine = (name) => `What? ${name} is evolving!`
export const evolvedLine = (name, form) => `${name} evolved into ${PIP_FORM_NAMES[form]}! 🌱`
export const devolvedLine = (form) => `I shrank back to ${PIP_FORM_NAMES[form]} 🌱 A few good days and I'll grow again!`

/** AC 8 / AC 9: the bubble for a phase of a change, or null. */
export function growthBubble({ change, phase, petName, seen, growth }) {
  if (phase === EVOLVING) return evolvingLine(petName)
  if (phase !== REVEALED) return null
  switch (change) {
    case GROWTH_CHANGES.EVOLVE:
      return growth.fullyGrown && !seen?.fullyGrown ? PIP_FULLY_GROWN_LINE : evolvedLine(petName, growth.form)
    case GROWTH_CHANGES.DEVOLVE: return devolvedLine(growth.form)
    case GROWTH_CHANGES.SLIP: return PIP_SLIP_LINE
    default: return null
  }
}
