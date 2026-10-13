import { MEAL_TYPE_LABELS } from '../constants/mealTypes.js'
import {
  PET_MOODS,
  PET_MOOD_LABELS,
  PET_COUNTED_MEAL_TYPES,
  PET_MEAL_TIME_KEY,
  PET_SLOT_STATUS
} from '../constants/pet.js'

const NOT_READY = { mood: PET_MOODS.CONTENT, dueCount: 0, todaySlots: [], lastLoggedType: null, lastLoggedAt: null, dueMealType: null }

/**
 * MPP-14 AC 6/7: the pet's mood, derived from YOUR ticks on the (possibly shared)
 * plan (MPP-33) — so every device you use agrees and a reload changes nothing.
 *
 * Counted per meal SLOT (date × breakfast/lunch/dinner): a slot is logged when any of
 * its entries is eaten, and due when it is planned, nothing in it is eaten and its "by"
 * time (yours) has passed. Due slots are counted over yesterday + today;
 * "logged" (Content vs Happy) over today only.
 *
 * AC 7 "logging any one meal returns the pet to Happy immediately": if the latest log
 * came after the latest due moment, the pet is Happy; he only turns Bored/Mischievous
 * again when another meal time passes.
 *
 * MPP-18: also returns lastLoggedAt, the eatenAt of that latest log, so /pet can tell
 * whether Pip has already cooked it.
 *
 * @param {{ yesterday: Object|null, today: Object|null, mealTimes: Object|null, now: Date }} input
 *   yesterday/today are MealPlanDayDTOs; mealTimes is PetDTO.mealTimes.
 */
export function derivePetMood({ yesterday, today, mealTimes, now }) {
  if (!mealTimes || !today || !hasMealTimeStrings(mealTimes)) return NOT_READY

  const slots = [
    ...buildSlots(yesterday, mealTimes, now, false),
    ...buildSlots(today, mealTimes, now, true)
  ]
  const due = slots.filter(slot => slot.status === PET_SLOT_STATUS.DUE)
  const logged = slots.filter(slot => slot.status === PET_SLOT_STATUS.LOGGED)
  const latestLog = logged.reduce((latest, slot) => (latest && latest.eatenAt >= slot.eatenAt ? latest : slot), null)
  const latestDueAt = due.reduce((max, slot) => Math.max(max, slot.dueAt), -Infinity)

  return {
    mood: pickMood({ dueCount: due.length, latestLog, latestDueAt, loggedToday: logged.some(slot => slot.isToday) }),
    dueCount: due.length,
    todaySlots: slots
      .filter(slot => slot.isToday)
      .map(({ mealType, status, byTime }) => ({ mealType, status, byTime })),
    lastLoggedType: latestLog?.mealType ?? null,
    // MPP-18: when the latest log happened (epoch ms); null when its eatenAt was missing (mapped to 0).
    lastLoggedAt: latestLog?.eatenAt || null,
    dueMealType: due[0]?.mealType ?? null
  }
}

/** Speech-bubble copy. Mischief is boredom, never health or food guilt (AC 9). */
export function petBubble({ mood, lastLoggedType, dueMealType }) {
  switch (mood) {
    case PET_MOODS.HAPPY:
      return lastLoggedType ? `${MEAL_TYPE_LABELS[lastLoggedType]} logged! Nap time.` : 'All caught up! Nap time.'
    case PET_MOODS.BORED:
      return `Did ${MEAL_TYPE_LABELS[dueMealType].toLowerCase()} happen? I'm getting bored...`
    case PET_MOODS.MISCHIEVOUS:
      return "I didn't touch the takeaway. Log a meal and it never happened."
    default:
      return 'Nothing due yet. Just vibing.'
  }
}

/** AC 7: the reaction shows for an eaten breakfast/lunch/dinner entry, never a snack or extra. */
export function shouldShowPetReaction({ eaten, mealType }) {
  return eaten === true && PET_COUNTED_MEAL_TYPES.includes(mealType)
}

/** AC 7 reaction copy, e.g. "Pip is happy! Lunch logged." */
export function petReactionText({ petName, mealType }) {
  return `${petName} is happy! ${MEAL_TYPE_LABELS[mealType]} logged.`
}

export function petChipLabel({ mood, dueCount }) {
  const label = PET_MOOD_LABELS[mood]
  return mood === PET_MOODS.BORED || mood === PET_MOODS.MISCHIEVOUS ? `${label} · ${dueCount} unlogged` : label
}

// A malformed PetDTO must not throw inside PetProvider (no error boundary above it).
function hasMealTimeStrings(mealTimes) {
  return PET_COUNTED_MEAL_TYPES.every(type => typeof mealTimes[PET_MEAL_TIME_KEY[type]] === 'string')
}

// Slots come out in time order: yesterday B/L/D, then today B/L/D — so due[0] is the earliest.
function buildSlots(day, mealTimes, now, isToday) {
  if (!day) return []
  return PET_COUNTED_MEAL_TYPES.map(mealType => {
    const entries = day.mealsByType?.[mealType] ?? []
    const byTime = mealTimes[PET_MEAL_TIME_KEY[mealType]]
    const dueAt = atLocalTime(day.date, byTime)
    const eatenTimes = entries.filter(e => e.eaten === true).map(e => (e.eatenAt ? Date.parse(e.eatenAt) : 0))
    return {
      mealType,
      byTime,
      dueAt,
      isToday,
      eatenAt: eatenTimes.length > 0 ? Math.max(...eatenTimes) : null,
      status: slotStatus(entries.length, eatenTimes.length, dueAt, now)
    }
  })
}

function slotStatus(plannedCount, eatenCount, dueAt, now) {
  if (plannedCount === 0) return PET_SLOT_STATUS.UNPLANNED
  if (eatenCount > 0) return PET_SLOT_STATUS.LOGGED
  return now.getTime() > dueAt ? PET_SLOT_STATUS.DUE : PET_SLOT_STATUS.UPCOMING
}

function pickMood({ dueCount, latestLog, latestDueAt, loggedToday }) {
  if (dueCount > 0 && latestLog && latestLog.eatenAt > latestDueAt) return PET_MOODS.HAPPY
  if (dueCount >= 2) return PET_MOODS.MISCHIEVOUS
  if (dueCount === 1) return PET_MOODS.BORED
  return loggedToday ? PET_MOODS.HAPPY : PET_MOODS.CONTENT
}

// "YYYY-MM-DD" + "HH:mm" in the device's local time, as epoch ms.
function atLocalTime(isoDate, hhmm) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const [hour, minute] = hhmm.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).getTime()
}
