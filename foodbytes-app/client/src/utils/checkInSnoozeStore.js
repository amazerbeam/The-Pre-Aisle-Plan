import { CHECKIN_SNOOZE_STORAGE_KEY } from '../constants/pet.js'

// userId → 'YYYY-MM-DD'. Survives route changes but not a reload, so when storage is
// unavailable "Not now" still holds for this page load (MPP-21 AC 4).
const memory = new Map()

const keyFor = (userId) => `${CHECKIN_SNOOZE_STORAGE_KEY}.${userId}`

/** MPP-21: the day this user last tapped "Not now" in this browser, or null. Memory wins over storage. */
export function readSnoozedOn(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    return localStorage.getItem(keyFor(userId))
  } catch {
    // Storage disabled or blocked: nothing snoozed beyond this page load.
    return null
  }
}

/** Records the day in memory always, and in localStorage when it is available. */
export function writeSnoozedOn(userId, todayISO) {
  memory.set(userId, todayISO)
  try {
    localStorage.setItem(keyFor(userId), todayISO)
  } catch {
    // Storage disabled or full: the memory copy above still snoozes this page load.
  }
}
