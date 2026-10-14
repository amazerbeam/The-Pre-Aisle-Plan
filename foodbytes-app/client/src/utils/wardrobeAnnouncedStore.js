import { WARDROBE_ANNOUNCED_STORAGE_KEY } from '../constants/pipWardrobe.js'

// userId → Set of item ids Pip has already announced here. Survives route changes but not a
// reload, so with storage unavailable an unlock is announced at most once per page load.
const memory = new Map()

const keyFor = (userId) => `${WARDROBE_ANNOUNCED_STORAGE_KEY}.${userId}`

/** MPP-32 AC 6: the ids this browser has already announced for this user. Memory wins. */
export function readAnnounced(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    // Storage blocked or corrupt JSON: nothing announced yet.
    return new Set()
  }
}

/** Records the ids in memory always, and in localStorage when it is available. */
export function writeAnnounced(userId, ids) {
  const set = new Set(ids)
  memory.set(userId, set)
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify([...set]))
  } catch {
    // Storage disabled or full: the memory copy still stops a repeat this load.
  }
}
