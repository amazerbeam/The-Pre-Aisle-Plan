import {
  PET_COUNTED_MEAL_TYPES,
  PET_MEAL_TIME_KEY,
  PIP_POSITIONS,
  PIP_COOKER_WINDOW_MIN,
  PIP_BED_AFTER_DINNER_MIN,
  PIP_WAKE_BEFORE_BREAKFAST_MIN
} from '../constants/pet.js'

const MINUTES_PER_DAY = 24 * 60
const HHMM = /^(\d{1,2}):(\d{2})(?::\d{2})?$/

/**
 * MPP-17 AC 1/2: where Pip is in his room right now, from YOUR meal times (MPP-33).
 *
 * Cooker: within PIP_COOKER_WINDOW_MIN of any breakfast/lunch/dinner time (inclusive),
 * measured on a 24 h circle so a late dinner's window can cross midnight.
 * Bed: from dinner + PIP_BED_AFTER_DINNER_MIN (inclusive) to the next breakfast −
 * PIP_WAKE_BEFORE_BREAKFAST_MIN (exclusive). If that span is empty, Pip doesn't sleep.
 * Rug: otherwise, and whenever the meal times are missing or malformed.
 * Cooker wins over bed.
 *
 * @param {Date} now
 * @param {Object|null} mealTimes PetDTO.mealTimes ({ breakfastBy, lunchBy, dinnerBy })
 * @returns {'rug'|'cooker'|'bed'}
 */
export function pipPosition(now, mealTimes) {
  const times = readMealMinutes(mealTimes)
  if (!times) return PIP_POSITIONS.RUG

  const minute = now.getHours() * 60 + now.getMinutes()
  const nearMeal = Object.values(times).some(time => circularDistance(minute, time) <= PIP_COOKER_WINDOW_MIN)
  if (nearMeal) return PIP_POSITIONS.COOKER
  return isBedtime(minute, times) ? PIP_POSITIONS.BED : PIP_POSITIONS.RUG
}

// { breakfast, lunch, dinner } in minutes of the day, or null if any is unusable.
function readMealMinutes(mealTimes) {
  if (!mealTimes) return null
  const times = {}
  for (const mealType of PET_COUNTED_MEAL_TYPES) {
    const minutes = toMinutes(mealTimes[PET_MEAL_TIME_KEY[mealType]])
    if (minutes === null) return null
    times[mealType] = minutes
  }
  return times
}

// "HH:mm" or "HH:mm:ss" → minutes of the day; anything else → null.
function toMinutes(hhmm) {
  if (typeof hhmm !== 'string') return null
  const match = HHMM.exec(hhmm)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null
}

function circularDistance(a, b) {
  const diff = Math.abs(a - b) % MINUTES_PER_DAY
  return Math.min(diff, MINUTES_PER_DAY - diff)
}

// Measured in minutes since dinner, so the window can run past midnight.
function isBedtime(minute, { breakfast, dinner }) {
  const sinceDinner = (minute - dinner + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const toNextBreakfast = (breakfast - dinner + MINUTES_PER_DAY) % MINUTES_PER_DAY || MINUTES_PER_DAY
  const wakeAt = toNextBreakfast - PIP_WAKE_BEFORE_BREAKFAST_MIN
  return sinceDinner >= PIP_BED_AFTER_DINNER_MIN && sinceDinner < wakeAt
}
