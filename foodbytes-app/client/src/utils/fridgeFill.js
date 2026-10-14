import { PET_COUNTED_MEAL_TYPES, PIP_POSITIONS } from '../constants/pet.js'
import {
  FRIDGE_BANDS,
  FRIDGE_EMPTY_METER,
  FRIDGE_GAUGE_COLOURS,
  FRIDGE_LOW_BUBBLE,
  FRIDGE_LOW_PCT,
  FRIDGE_NOTES,
  FRIDGE_PLENTY_PCT,
  FRIDGE_SLOT_COUNT
} from '../constants/petRoom.js'
import { addDays, formatDateISO, parseISODate } from './dateUtils.js'

const DAY_MS = 86_400_000
const WINDOW_DAYS = 7
const EMPTY_FILL = { planned: 0, remaining: 0, pct: 0, filledSlots: 0 }

/**
 * MPP-19: which 7 days count as "this week" — the meal-plan week containing today, on the
 * same start weekday as the calendar (anchorISO = MealPlanContext.startDate). The open
 * question in the spec lives here and only here.
 * @returns {{ start: string, end: string }}
 */
export function fridgeWindow(anchorISO, todayISO) {
  const anchor = parseISODate(anchorISO)
  // Rounded, so a DST change inside the gap can't shift the day count.
  const daysSince = Math.round((parseISODate(todayISO) - anchor) / DAY_MS)
  const start = addDays(anchor, Math.floor(daysSince / WINDOW_DAYS) * WINDOW_DAYS)
  return { start: formatDateISO(start), end: formatDateISO(addDays(start, WINDOW_DAYS - 1)) }
}

/** True when the plan is the week that starts at range.start (guards a stale week while a new one loads). */
export function planCoversRange(plan, range) {
  return plan?.startDate === range.start || Boolean(plan?.days?.some(day => day?.date === range.start))
}

/**
 * MPP-28: the one meal-plan read PetContext makes — yesterday (mood) through the fridge week's last
 * day. The fridge week when it already holds yesterday (7 days), else from yesterday (8 days).
 */
export function petPlanRange(fridgeRange, yesterdayISO) {
  return yesterdayISO < fridgeRange.start
    ? { start: yesterdayISO, days: WINDOW_DAYS + 1 }
    : { start: fridgeRange.start, days: WINDOW_DAYS }
}

/** MPP-28: false when the calendar's week is the fridge week AND holds yesterday — then it covers both. */
export function needsPetDays(calendarIsFridgeWeek, fridgeRange, yesterdayISO) {
  return !(calendarIsFridgeWeek && fridgeRange.start <= yesterdayISO)
}

/**
 * MPP-19 AC 1: planned = breakfast/lunch/dinner ENTRIES in the range (shared plan);
 * remaining = those the viewer hasn't ticked eaten (MPP-33: `eaten` is the viewer's own).
 * filledSlots is out of 15, at least 1 while anything remains.
 * @param {{ days?: Array }|null} plan  a MealPlanWeekDTO
 * @param {{ start: string, end: string }} range  from fridgeWindow
 */
export function fridgeFill(plan, range) {
  let planned = 0
  let remaining = 0
  for (const day of plan?.days ?? []) {
    if (!day?.date || day.date < range.start || day.date > range.end) continue
    for (const mealType of PET_COUNTED_MEAL_TYPES) {
      for (const entry of day.mealsByType?.[mealType] ?? []) {
        planned += 1
        if (entry?.eaten !== true) remaining += 1
      }
    }
  }
  if (planned === 0) return EMPTY_FILL
  const filledSlots = remaining === 0 ? 0 : Math.max(1, Math.round((FRIDGE_SLOT_COUNT * remaining) / planned))
  return { planned, remaining, pct: Math.round((100 * remaining) / planned), filledSlots }
}

/** AC 5: which note applies. */
export function fridgeBand({ planned, remaining, pct }) {
  if (planned === 0) return FRIDGE_BANDS.NONE
  if (remaining === 0) return FRIDGE_BANDS.EMPTY
  if (remaining === planned) return FRIDGE_BANDS.FULL
  return pct <= FRIDGE_LOW_PCT ? FRIDGE_BANDS.LOW : FRIDGE_BANDS.PLENTY
}

/** AC 4: green above 50 %, amber above 20 %, red at 20 % or below. */
export function fridgeGaugeColour(pct) {
  if (pct > FRIDGE_PLENTY_PCT) return FRIDGE_GAUGE_COLOURS.high
  if (pct > FRIDGE_LOW_PCT) return FRIDGE_GAUGE_COLOURS.mid
  return FRIDGE_GAUGE_COLOURS.low
}

export function fridgeNote(fill) {
  return FRIDGE_NOTES[fridgeBand(fill)]
}

/** AC 2: "71% full · 15 of 21 planned meals left". */
export function fridgeMeterText({ planned, remaining, pct }) {
  if (planned === 0) return FRIDGE_EMPTY_METER
  return `${pct}% full · ${remaining} of ${planned} planned meals left`
}

/**
 * AC 4: Pip's idle line at 20 % or below. Not while he's asleep (mockup: never at night),
 * not with nothing planned (the fridge view asks you to plan), not while loading (null fill).
 */
export function fridgeBubble(fill, position) {
  if (!fill || fill.planned === 0 || position === PIP_POSITIONS.BED) return null
  return fill.pct <= FRIDGE_LOW_PCT ? FRIDGE_LOW_BUBBLE : null
}
