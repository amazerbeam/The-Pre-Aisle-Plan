// Run: npm run check:cook   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-18 cook-and-serve
// rules are pinned here. Mirrors pipPosition.check.mjs.
import assert from 'node:assert/strict'
import { shouldServe, cookServeSchedule, cookServeBubble } from './cookServe.js'
import { readLastSeenEatenAt, writeLastSeenEatenAt } from './pipSeenStore.js'

const T = Date.UTC(2026, 9, 13, 12, 5)

// AC 1/4: play only when the latest log is newer than the marker; never seen → play.
assert.equal(shouldServe(T, null), true)
assert.equal(shouldServe(T, T - 1), true)
assert.equal(shouldServe(T, T), false)
assert.equal(shouldServe(T, T + 60_000), false)
assert.equal(shouldServe(null, null), false)
assert.equal(shouldServe(Number.NaN, null), false)
assert.equal(shouldServe(T, Number.NaN), true) // a corrupt marker reads as never seen

// AC 1: full scene in order with the mockup's timings; AC 5: served only, no walking.
assert.deepEqual(cookServeSchedule(false), [
  { phase: 'walking', ms: 1300 },
  { phase: 'cooking', ms: 2200 },
  { phase: 'served', ms: 1600 },
  { phase: 'returning', ms: 1300 }
])
assert.deepEqual(cookServeSchedule(true), [{ phase: 'served', ms: 2500 }])

// AC 1: bubble copy; "<Meal> is served! 🍽️".
assert.equal(cookServeBubble({ phase: 'walking', mealType: 'lunch' }), 'Yay, lunch time! Let me cook 🍳')
assert.equal(cookServeBubble({ phase: 'cooking', mealType: 'dinner' }), 'Cooking your dinner…')
assert.equal(cookServeBubble({ phase: 'served', mealType: 'breakfast' }), 'Breakfast is served! 🍽️')
assert.equal(cookServeBubble({ phase: 'returning', mealType: 'lunch' }), 'Yum! 💜')
assert.equal(cookServeBubble({ phase: 'served', mealType: 'brunch' }), null)
assert.equal(cookServeBubble({ phase: 'dancing', mealType: 'lunch' }), null)

// AC 3: storage that throws -> nothing breaks, and the marker lives in memory for this load.
const setStorage = (value) =>
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => value })
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  get: () => { throw new Error('storage disabled') }
})
assert.equal(readLastSeenEatenAt(1), null)
writeLastSeenEatenAt(1, T)
assert.equal(readLastSeenEatenAt(1), T)
assert.equal(shouldServe(T, readLastSeenEatenAt(1)), false) // no second replay this load

// Working storage: persisted per user under the prefixed key (AC 6: users never share it).
const store = new Map()
setStorage({ getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) })
writeLastSeenEatenAt(2, T)
assert.equal(store.get('foodbytes.pip.lastSeenEatenAt.2'), String(T))
assert.equal(readLastSeenEatenAt(2), T)
assert.equal(readLastSeenEatenAt(3), null)

// A corrupt stored value reads as never seen.
store.set('foodbytes.pip.lastSeenEatenAt.4', 'yesterday')
assert.equal(readLastSeenEatenAt(4), null)

// Readable storage whose writes throw (quota/blocked): memory must win over a stale or corrupt value,
// otherwise the scene replays after every run (AC 3/4).
const stale = new Map([
  ['foodbytes.pip.lastSeenEatenAt.5', String(T - 86_400_000)],
  ['foodbytes.pip.lastSeenEatenAt.6', 'yesterday']
])
setStorage({ getItem: k => (stale.has(k) ? stale.get(k) : null), setItem: () => { throw new Error('quota') } })
for (const id of [5, 6]) {
  writeLastSeenEatenAt(id, T)
  assert.equal(readLastSeenEatenAt(id), T)
  assert.equal(shouldServe(T, readLastSeenEatenAt(id)), false)
}

console.log('cook-and-serve checks passed')
