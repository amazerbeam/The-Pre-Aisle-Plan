// Run: npm run check:cook   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-18 cook-and-serve
// rules are pinned here. Mirrors pipPosition.check.mjs.
import assert from 'node:assert/strict'
import { shouldServe, cookServeSchedule, cookServeBubble, shouldTakeToPip, pipWalkMs } from './cookServe.js'
import { COOK_PHASE_MS, PIP_ANIMATION_MAX_MS } from '../constants/pet.js'
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

// AC 1: full scene in order; MPP-29 AC 2 retuned it to 3.0 s end to end. AC 5: served only, no walking.
assert.deepEqual(cookServeSchedule(false), [
  { phase: 'walking', ms: 700 },
  { phase: 'cooking', ms: 1000 },
  { phase: 'served', ms: 800 },
  { phase: 'returning', ms: 500 }
])
assert.deepEqual(cookServeSchedule(true), [{ phase: 'served', ms: 2500 }])

// MPP-29 AC 2: no one-shot sequence runs longer than PIP_ANIMATION_MAX_MS, either way.
const total = (steps) => steps.reduce((sum, { ms }) => sum + ms, 0)
assert.ok(total(cookServeSchedule(false)) <= PIP_ANIMATION_MAX_MS, 'cook scene over the 3 s limit')
assert.ok(total(cookServeSchedule(true)) <= PIP_ANIMATION_MAX_MS, 'reduced-motion serve over the 3 s limit')

// MPP-29 regression: PipWalker's CSS walk lasts exactly the phase that starts it, so Pip is on
// the rug when the scene ends (a 700 ms walk in the 500 ms `returning` phase overran by 200 ms).
assert.equal(pipWalkMs('walking'), COOK_PHASE_MS.walking)
assert.equal(pipWalkMs('returning'), COOK_PHASE_MS.returning)
assert.equal(pipWalkMs(null), COOK_PHASE_MS.walking) // idle: the next walk is always the walk out
let walkEndsAt = 0
let sceneStart = 0
for (const { phase, ms } of cookServeSchedule(false)) {
  if (phase === 'walking' || phase === 'returning') {
    assert.equal(pipWalkMs(phase), ms, `${phase} walk does not match its phase`)
    walkEndsAt = sceneStart + pipWalkMs(phase)
  }
  sceneStart += ms
}
assert.ok(walkEndsAt <= sceneStart, 'Pip still walking after the cook scene ends')
assert.ok(walkEndsAt <= PIP_ANIMATION_MAX_MS, 'walk back over the 3 s limit')

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

// MPP-34: hand off to Pip only when MPP-18 will play for the tick.
const TODAY_ISO = '2026-10-14'
const YESTERDAY_ISO = '2026-10-13'
const handoff = (over) => shouldTakeToPip({
  isAuthenticated: true, petReady: true, mealType: 'lunch',
  planDate: TODAY_ISO, todayISO: TODAY_ISO, yesterdayISO: YESTERDAY_ISO, ...over
})
assert.equal(handoff({}), true)
assert.equal(handoff({ mealType: 'breakfast' }), true)
assert.equal(handoff({ mealType: 'dinner' }), true)
assert.equal(handoff({ planDate: YESTERDAY_ISO }), true)            // catching up on yesterday still plays
assert.equal(handoff({ mealType: 'snacks' }), false)                // AC 3: uncounted types stay put
assert.equal(handoff({ mealType: 'extras' }), false)
assert.equal(handoff({ isAuthenticated: false }), false)            // AC 4: guest
assert.equal(handoff({ petReady: false }), false)                   // no Pip loaded → no scene to see
assert.equal(handoff({ planDate: '2026-10-12' }), false)            // outside MPP-18's yesterday+today window
assert.equal(handoff({ planDate: '2026-10-15' }), false)            // a future day

console.log('cook-and-serve checks passed')
