import { PIP_SEEN_EATEN_STORAGE_KEY } from '../constants/pet.js'

// userId → epoch ms. Survives route changes but not a reload, so when storage is
// unavailable the scene replays at most once per page load (MPP-18 AC 3).
const memory = new Map()

const keyFor = (userId) => `${PIP_SEEN_EATEN_STORAGE_KEY}.${userId}`

/**
 * MPP-18: the eatenAt (epoch ms) of the last meal Pip cooked for this user in this
 * browser, or null. The larger of localStorage and this page load's memory, so a failed
 * storage write (stale or corrupt value left behind) can never undo the marker.
 */
export function readLastSeenEatenAt(userId) {
  let stored = null
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (raw !== null) stored = toMs(raw)
  } catch {
    // Storage disabled or blocked: memory below is the only source.
  }
  const remembered = memory.get(userId)
  const inMemory = Number.isFinite(remembered) ? remembered : null
  if (stored === null) return inMemory
  if (inMemory === null) return stored
  return Math.max(stored, inMemory)
}

/** Records the marker in memory always, and in localStorage when it is available. */
export function writeLastSeenEatenAt(userId, eatenAtMs) {
  memory.set(userId, eatenAtMs)
  try {
    localStorage.setItem(keyFor(userId), String(eatenAtMs))
  } catch {
    // Storage disabled or full: the memory copy above still stops a replay this load.
  }
}

function toMs(stored) {
  const ms = Number(stored)
  return Number.isFinite(ms) ? ms : null
}
