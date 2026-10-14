import { PIP_GROWTH_SEEN_STORAGE_KEY } from '../constants/pipGrowth.js'

// userId → the growth this browser last finished showing. Survives route changes but not a
// reload, so with storage unavailable an evolve replays at most once per page load.
const memory = new Map()

const keyFor = (userId) => `${PIP_GROWTH_SEEN_STORAGE_KEY}.${userId}`

/**
 * MPP-31: the growth (PetGrowthDTO shape) Pip last finished showing this user here, or null for a
 * first visit. This page load's memory wins over storage, since it is always written last.
 */
export function readSeenGrowth(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const raw = localStorage.getItem(keyFor(userId))
    return raw === null ? null : toGrowth(JSON.parse(raw))
  } catch {
    // Storage blocked, or a corrupt value: treat as a first visit.
    return null
  }
}

/** Records the marker in memory always, and in localStorage when it is available. */
export function writeSeenGrowth(userId, growth) {
  memory.set(userId, growth)
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(growth))
  } catch {
    // Storage disabled or full: the memory copy still stops a replay this load.
  }
}

// Only a value with a numeric form and points is a marker; anything else reads as a first visit.
function toGrowth(value) {
  return value && Number.isFinite(value.form) && Number.isFinite(value.points) ? value : null
}
