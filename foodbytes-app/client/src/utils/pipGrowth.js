import {
  PIP_BAR_MOVE_MS, PIP_GROWTH_BUBBLE_MS, PIP_GROWTH_PHASES, PIP_GROWTH_PHASE_MS, PIP_SLIP_SCORE
} from '../constants/pipGrowth.js'
import { PIP_DEFAULT_LINE, formName, lineCopy } from '../constants/pipLines.js'

const { FILLING, EVOLVING, REVEALED } = PIP_GROWTH_PHASES

export const GROWTH_CHANGES = { EVOLVE: 'evolve', SLIP: 'slip', MOVE: 'move' }

/**
 * The growth payload (PetGrowthDTO) seen through one line: the shared points and last day plus that
 * line's form and bar. Null when the payload has no lines (legacy or missing), so callers fall back.
 */
export function lineGrowth(dto, line) {
  const own = dto?.lines?.[line] ?? dto?.lines?.[PIP_DEFAULT_LINE]
  if (!own) return null
  return { points: dto.points, lastDayScore: dto.lastDayScore, lastScoredDate: dto.lastScoredDate, ...own }
}

/** AC 7: wilted from the day after a −3 day until the next +3 day (the latest scored day is a slip). */
export const isWilted = (growth) => growth?.lastDayScore === PIP_SLIP_SCORE

const isBelowStart = (growth) => growth.points < growth.formStart

/** 0–100 for the bar; the last form (no bar) is full; below the form's start the bar sits empty. */
export function barPct(growth) {
  if (!growth) return 0
  if (growth.barSize == null) return 100
  if (isBelowStart(growth)) return 0
  return Math.round((100 * growth.barCurrent) / growth.barSize)
}

/** "6 / 21", or the real points over the form's start ("12 / 15") once slips drop below it. */
export const barCount = (growth) => (isBelowStart(growth)
  ? `${growth.points} / ${growth.formStart}`
  : `${growth.barCurrent} / ${growth.barSize}`)

/** "Wyrmling · 6 / 21 → Drake", "Wyrmling · 12 / 15" below the start, or the line's fully-grown label. */
export function levelBarLabel(growth, line) {
  if (!growth) return null
  if (growth.fullyGrown || growth.barSize == null) return lineCopy(line).fullyGrownLabel
  const name = formName(line, growth.form)
  if (isBelowStart(growth)) return `${name} · ${barCount(growth)}`
  return `${name} · ${barCount(growth)} → ${formName(line, growth.form + 1)}`
}

/** What changed since this browser last showed Pip (both sides projected on one line); null when nothing to play. Forms never shrink: a drop just settles. */
export function growthChange(seen, growth) {
  if (!seen || !growth) return null
  if (growth.form > seen.form) return GROWTH_CHANGES.EVOLVE
  if (growth.lastScoredDate !== seen.lastScoredDate && growth.lastDayScore === PIP_SLIP_SCORE) return GROWTH_CHANGES.SLIP
  if (growth.points !== seen.points || growth.form !== seen.form) return GROWTH_CHANGES.MOVE
  return null
}

/** The steps to play. Reduced motion keeps only the bubble steps. */
export function growthSchedule(change, reducedMotion) {
  const step = (phase, ms = PIP_GROWTH_PHASE_MS[phase]) => ({ phase, ms })
  const revealed = step(REVEALED, change === GROWTH_CHANGES.MOVE ? PIP_BAR_MOVE_MS : PIP_GROWTH_BUBBLE_MS)
  if (change === GROWTH_CHANGES.EVOLVE) {
    return reducedMotion ? [step(EVOLVING), revealed] : [step(FILLING), step(EVOLVING), revealed]
  }
  return [revealed]
}

/**
 * What Pip and the bar show at a phase. Before an evolve the old form and its full bar show; the
 * new form's bar starts empty and then settles. `phase` null = a change is pending but not started:
 * the last-seen state, so the bar animates from where the viewer left it.
 */
export function growthView(phase, seen, growth, line) {
  const old = seen ?? growth
  switch (phase) {
    case null: return { form: old.form, pct: barPct(old), label: levelBarLabel(old, line) }
    case FILLING: return { form: old.form, pct: 100, label: levelBarLabel(old, line) }
    case EVOLVING: return { form: growth.form, pct: 0, label: levelBarLabel(growth, line) }
    default: return { form: growth.form, pct: barPct(growth), label: levelBarLabel(growth, line) }
  }
}

/** The "+3" / "−3" and the count that pop over the bar; null when points didn't move or either side has no bar. */
export function growthGain(seen, growth, steps) {
  const delta = growth.points - seen.points
  if (!delta || seen.barSize == null || growth.barSize == null) return null
  const delayMs = steps.filter(({ phase }) => phase !== REVEALED).reduce((sum, { ms }) => sum + ms, 0)
  return { text: delta > 0 ? `+${delta}` : `−${-delta}`, gained: delta > 0, count: barCount(growth), delayMs }
}

export const evolvingLine = (name) => `What? ${name} is evolving!`
export const evolvedLine = (name, line, form) => `${name} evolved into ${formName(line, form)}! ${lineCopy(line).evolveEmoji}`

/** The bubble for a phase of a change, or null. */
export function growthBubble({ change, phase, petName, seen, growth, line }) {
  if (phase === EVOLVING) return evolvingLine(petName)
  if (phase !== REVEALED) return null
  switch (change) {
    case GROWTH_CHANGES.EVOLVE:
      return growth.fullyGrown && !seen?.fullyGrown ? lineCopy(line).fullyGrownLine : evolvedLine(petName, line, growth.form)
    case GROWTH_CHANGES.SLIP: return lineCopy(line).slipLine
    default: return null
  }
}
