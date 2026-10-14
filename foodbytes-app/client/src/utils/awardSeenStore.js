import { AWARD_SEEN_STORAGE_KEY } from '../constants/petAwards.js'

// userId → { PLAN: { 1: n, … }, SNACK: {…}, ALCOHOL: {…} }. Survives route changes but not a
// reload, so when storage is unavailable an award is still announced at most once per page load.
const memory = new Map()

const keyFor = (userId) => `${AWARD_SEEN_STORAGE_KEY}.${userId}`

/** MPP-23: the award counts this browser last saw for this user, or null (never looked / unreadable). Memory wins. */
export function readAwardCounts(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    // Storage blocked or corrupt JSON: treat as a first visit (silent re-baseline).
    return null
  }
}

/** Records the counts in memory always, and in localStorage when it is available. */
export function writeAwardCounts(userId, counts) {
  memory.set(userId, counts)
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(counts))
  } catch {
    // Storage disabled or full: the memory copy above still stops a repeat this load.
  }
}
