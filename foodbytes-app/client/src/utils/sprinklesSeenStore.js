import { SPRINKLES_SEEN_STORAGE_KEY } from '../constants/petSprinkles.js'

// userId → the last balance the Pip tab showed. Survives route changes but not a reload, so with
// storage blocked the count-up still never replays within a page load (MPP-42 AC 14).
const memory = new Map()

const keyFor = (userId) => `${SPRINKLES_SEEN_STORAGE_KEY}.${userId}`

/** The balance this browser last showed this user on the Pip tab, or null (first visit / unreadable). Memory wins. */
export function readSeenSprinkles(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    // Storage blocked: treat as a first visit — no animation (AC 14).
    return null
  }
}

/** Records the balance in memory always, and in localStorage when it is available. */
export function writeSeenSprinkles(userId, balance) {
  memory.set(userId, balance)
  try {
    localStorage.setItem(keyFor(userId), String(balance))
  } catch {
    // Storage disabled or full: the memory copy still stops a replay this load.
  }
}
