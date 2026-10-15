import { DECOR_ITEMS, ROOM_STYLES, ROOM_SPOTS } from '../constants/petDecor.js'
import { MEAL_TYPE_LABELS } from '../constants/mealTypes.js'
import { STATION_LEVEL_NAMES } from '../constants/petShop.js'
import {
  COUNT_UP_MAX_MS, COUNT_UP_MIN_MS, COUNT_UP_MS_PER_SPRINKLE, EARNED_FALLBACK_LINE,
  RECENT_TEXT, RELATIVE_DAY, SHORT_MONTHS, SHORT_WEEKDAYS
} from '../constants/petSprinkles.js'

/**
 * MPP-42: the Earn tab's and the count-up's pure logic — grouping and wording the recent ledger,
 * the good-week sum, the count-up duration and Pip's "+N …" line. Pinned by sprinkleHistory.check.mjs.
 * Entries are RecentSprinklesDTO.entries, newest first.
 */

const MEAL_SOURCES = ['MEAL_EATEN', 'MEAL_ON_TIME', 'HOMEMADE_EXTRA']
const SHOPPING_SOURCES = ['SHOPPING_LIST_GENERATED', 'SHOPPING_LIST_COMPLETED']
const DAY_MS = 86400000
const isMeal = (entry) => MEAL_SOURCES.includes(entry.sourceType) && entry.entryId != null

/** AC 4: a full week of every meal, all on time, the full week and both shopping rewards. */
export function goodWeek(rates) {
  const meals = rates.mealsPerWeek * rates.mealEaten
  const onTime = rates.mealsPerWeek * rates.onTimeBonus
  const shopping = rates.shoppingListGenerated + rates.shoppingListCompleted
  return { mealCount: rates.mealsPerWeek, meals, onTime, fullWeek: rates.fullWeek, shopping, total: meals + onTime + rates.fullWeek + shopping }
}

/** AC 5: one line per row, except one meal's MEAL_EATEN + MEAL_ON_TIME + HOMEMADE_EXTRA, which share a line. */
export function groupRecent(entries) {
  const lines = []
  const byMeal = new Map()
  entries.forEach((entry, index) => {
    if (isMeal(entry)) {
      const line = byMeal.get(entry.entryId)
      if (line) {
        line.amount += entry.amount
        line.sources.add(entry.sourceType)
        if (!line.entry.mealKey && entry.mealKey) line.entry = entry
        return
      }
      const fresh = { key: `meal-${entry.entryId}`, amount: entry.amount, createdAt: entry.createdAt, sources: new Set([entry.sourceType]), entry }
      byMeal.set(entry.entryId, fresh)
      lines.push(fresh)
      return
    }
    lines.push({ key: `${entry.sourceType}-${index}`, amount: entry.amount, createdAt: entry.createdAt, sources: new Set([entry.sourceType]), entry })
  })
  return lines.map(({ key, amount, createdAt, sources, entry }) => ({ key, amount, createdAt, text: describe(entry, sources) }))
}

function describe(entry, sources) {
  if (MEAL_SOURCES.includes(entry.sourceType)) {
    const label = MEAL_TYPE_LABELS[entry.mealKey]
    const parts = [label ? RECENT_TEXT.eaten(label) : RECENT_TEXT.mealFallback]
    if (sources.has('MEAL_ON_TIME')) parts.push(RECENT_TEXT.onTime)
    if (sources.has('HOMEMADE_EXTRA')) parts.push(RECENT_TEXT.homemade)
    return parts.join(' · ')
  }
  switch (entry.sourceType) {
    case 'FULL_WEEK': return entry.weekStart ? RECENT_TEXT.fullWeek(weekRange(entry.weekStart)) : RECENT_TEXT.earnFallback
    case 'SHOPPING_LIST_GENERATED': return RECENT_TEXT.listMade
    case 'SHOPPING_LIST_COMPLETED': return RECENT_TEXT.listDone
    case 'STATION_UPGRADE': {
      const name = STATION_LEVEL_NAMES[entry.station]?.[entry.level - 1]
      return name ? RECENT_TEXT.bought(name) : RECENT_TEXT.spendFallback
    }
    case 'DECOR_PURCHASE': {
      const item = DECOR_ITEMS[entry.decorItem]
      if (item) return RECENT_TEXT.bought(item.label)
      const style = ROOM_STYLES[entry.decorItem]
      if (style) return RECENT_TEXT.boughtStyle(style.label, style.spot === ROOM_SPOTS.WALL_STYLE)
      return RECENT_TEXT.spendFallback
    }
    default: return entry.amount < 0 ? RECENT_TEXT.spendFallback : RECENT_TEXT.earnFallback
  }
}

const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** "13–19 Oct", or "28 Sep – 4 Oct" across a month. weekStart is a Monday "YYYY-MM-DD". */
export function weekRange(weekStart) {
  const start = parseISODate(weekStart)
  const end = new Date(start.getTime() + 6 * DAY_MS)
  const month = (date) => SHORT_MONTHS[date.getUTCMonth()]
  return start.getUTCMonth() === end.getUTCMonth()
    ? `${start.getUTCDate()}–${end.getUTCDate()} ${month(end)}`
    : `${start.getUTCDate()} ${month(start)} – ${end.getUTCDate()} ${month(end)}`
}

/** The device's local calendar date of a Date, as "YYYY-MM-DD". */
export function localISO(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** AC 5: Today / Yesterday / weekday (within the week) / "3 Oct", on the device's own calendar. */
export function relativeDay(createdAt, todayISO) {
  const day = parseISODate(localISO(new Date(createdAt)))
  const days = Math.round((parseISODate(todayISO) - day) / DAY_MS)
  if (days <= 0) return RELATIVE_DAY.today
  if (days === 1) return RELATIVE_DAY.yesterday
  if (days < 7) return SHORT_WEEKDAYS[day.getUTCDay()]
  return `${day.getUTCDate()} ${SHORT_MONTHS[day.getUTCMonth()]}`
}

/** AC 15: longer for bigger gains, 0.7–1.6 s. */
export function countUpDuration(gain) {
  return Math.min(COUNT_UP_MAX_MS, Math.max(COUNT_UP_MIN_MS, COUNT_UP_MIN_MS + gain * COUNT_UP_MS_PER_SPRINKLE))
}

/**
 * AC 16: what Pip says after the count-up. Takes the newest earnings (spends skipped) until they add
 * up to the gain — no clock comparison — and says what they were. Nothing matched → a plain total.
 */
export function earnedLine(entries, gain) {
  const picked = []
  let sum = 0
  for (const entry of entries) {
    if (sum >= gain) break
    if (entry.amount <= 0) continue
    picked.push(entry)
    sum += entry.amount
  }
  if (picked.length === 0) return EARNED_FALLBACK_LINE(gain)

  const meals = new Set(picked.filter(isMeal).map(e => e.entryId))
  const onTime = new Set(picked.filter(e => e.sourceType === 'MEAL_ON_TIME').map(e => e.entryId))
  const fullWeek = picked.some(e => e.sourceType === 'FULL_WEEK')
  const shopping = picked.some(e => SHOPPING_SOURCES.includes(e.sourceType))
  const mealPart = meals.size === 1 ? 'a meal' : `${meals.size} meals`

  if (fullWeek || shopping) {
    const parts = [fullWeek && 'full week', shopping && 'shopping', meals.size > 0 && mealPart].filter(Boolean)
    const text = parts.join(' + ')
    return `+${gain}! ${text[0].toUpperCase()}${text.slice(1)} ${shopping ? '🛒✨' : '✨'}`
  }
  if (meals.size === 0) return EARNED_FALLBACK_LINE(gain)
  if (onTime.size === 0) return `+${gain}: ${mealPart} ✨`
  if (meals.size === 1) return `+${gain}: a meal, on time ✨`
  if (onTime.size === meals.size) return `+${gain}: ${mealPart}, ${meals.size === 2 ? 'both' : 'all'} on time ✨`
  return `+${gain}: ${mealPart}, ${onTime.size} on time ✨`
}
