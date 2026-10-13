// Run: npm run check:fridge   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-19 fridge rules
// (AC 1, 2, 4, 5) are pinned here. Mirrors cookServe.check.mjs.
import assert from 'node:assert/strict'
import {
  fridgeBand, fridgeBubble, fridgeFill, fridgeGaugeColour, fridgeMeterText, fridgeNote, fridgeWindow, planCoversRange
} from './fridgeFill.js'
import { FRIDGE_EMPTY_METER, FRIDGE_GAUGE_COLOURS, FRIDGE_LOW_BUBBLE, FRIDGE_NOTES } from '../constants/petRoom.js'

const RANGE = { start: '2026-10-12', end: '2026-10-18' }
const entry = (eaten) => ({ eaten })

// 12–18 Oct, one breakfast/lunch/dinner each (21 entries); the first `eatenCount` are eaten.
function week(eatenCount) {
  let left = eatenCount
  const days = Array.from({ length: 7 }, (_, i) => {
    const mealsByType = {}
    for (const type of ['breakfast', 'lunch', 'dinner']) {
      mealsByType[type] = [entry(left > 0)]
      left -= 1
    }
    return { date: `2026-10-${12 + i}`, mealsByType }
  })
  return { days }
}

// One day of `count` lunches, `eatenCount` of them eaten.
const lunches = (count, eatenCount) => ({
  days: [{ date: '2026-10-13', mealsByType: { lunch: Array.from({ length: count }, (_, i) => entry(i < eatenCount)) } }]
})

// --- fridgeWindow: 7 days aligned to the calendar's start weekday, containing today.
assert.deepEqual(fridgeWindow('2026-10-12', '2026-10-12'), RANGE)
assert.deepEqual(fridgeWindow('2026-10-12', '2026-10-18'), RANGE)
assert.deepEqual(fridgeWindow('2026-10-12', '2026-10-19'), { start: '2026-10-19', end: '2026-10-25' })
assert.deepEqual(fridgeWindow('2026-09-28', '2026-10-13'), RANGE) // calendar left two weeks back
assert.deepEqual(fridgeWindow('2026-10-26', '2026-10-13'), RANGE) // calendar moved ahead
assert.deepEqual(fridgeWindow('2026-10-21', '2026-10-28'), { start: '2026-10-28', end: '2026-11-03' }) // across the DST change

// --- AC 2, verbatim: 21 planned, 6 eaten.
const ac2 = fridgeFill(week(6), RANGE)
assert.deepEqual(ac2, { planned: 21, remaining: 15, pct: 71, filledSlots: 11 })
assert.equal(fridgeMeterText(ac2), '71% full · 15 of 21 planned meals left')
assert.equal(fridgeBand(ac2), 'plenty')
assert.equal(fridgeNote(ac2), FRIDGE_NOTES.plenty)
assert.equal(fridgeGaugeColour(ac2.pct), FRIDGE_GAUGE_COLOURS.high)
assert.equal(fridgeBubble(ac2, 'rug'), null)

// --- Spec AC 4: 4 of 21 left (19 %) → red, low, Pip says so (not while asleep).
const low = fridgeFill(week(17), RANGE)
assert.deepEqual(low, { planned: 21, remaining: 4, pct: 19, filledSlots: 3 })
assert.equal(fridgeBand(low), 'low')
assert.equal(fridgeNote(low), FRIDGE_NOTES.low)
assert.equal(fridgeGaugeColour(low.pct), FRIDGE_GAUGE_COLOURS.low)
assert.equal(fridgeBubble(low, 'rug'), FRIDGE_LOW_BUBBLE)
assert.equal(fridgeBubble(low, 'cooker'), FRIDGE_LOW_BUBBLE)
assert.equal(fridgeBubble(low, 'bed'), null)

// --- Band edges: exactly 20 % is low/red; exactly 50 % is amber; 29 % is amber + plenty.
const twenty = fridgeFill(lunches(5, 4), RANGE)
assert.equal(twenty.pct, 20)
assert.equal(fridgeBand(twenty), 'low')
assert.equal(fridgeGaugeColour(twenty.pct), FRIDGE_GAUGE_COLOURS.low)
assert.equal(fridgeBubble(twenty, 'rug'), FRIDGE_LOW_BUBBLE)
assert.equal(fridgeGaugeColour(fridgeFill(lunches(10, 5), RANGE).pct), FRIDGE_GAUGE_COLOURS.mid)
const amber = fridgeFill(week(15), RANGE)
assert.equal(amber.pct, 29)
assert.equal(fridgeBand(amber), 'plenty')
assert.equal(fridgeGaugeColour(amber.pct), FRIDGE_GAUGE_COLOURS.mid)

// --- AC 1: at least 1 slot while anything remains (15 × 1 / 40 rounds to 0).
assert.equal(fridgeFill(lunches(40, 39), RANGE).filledSlots, 1)

// --- Full and empty.
const full = fridgeFill(week(0), RANGE)
assert.deepEqual(full, { planned: 21, remaining: 21, pct: 100, filledSlots: 15 })
assert.equal(fridgeBand(full), 'full')
assert.equal(fridgeNote(full), FRIDGE_NOTES.full)
const empty = fridgeFill(week(21), RANGE)
assert.deepEqual(empty, { planned: 21, remaining: 0, pct: 0, filledSlots: 0 })
assert.equal(fridgeBand(empty), 'empty')
assert.equal(fridgeNote(empty), FRIDGE_NOTES.empty)
assert.equal(fridgeBubble(empty, 'rug'), FRIDGE_LOW_BUBBLE)

// --- AC 5: nothing planned → empty fridge with the plan prompt, and no low bubble.
for (const plan of [null, {}, { days: [] }, week(0)]) {
  const range = plan === null || !plan.days?.length ? RANGE : { start: '2026-11-01', end: '2026-11-07' }
  const none = fridgeFill(plan, range)
  assert.deepEqual(none, { planned: 0, remaining: 0, pct: 0, filledSlots: 0 })
  assert.equal(fridgeBand(none), 'none')
  assert.equal(fridgeNote(none), FRIDGE_NOTES.none)
  assert.equal(fridgeMeterText(none), FRIDGE_EMPTY_METER)
  assert.equal(fridgeBubble(none, 'rug'), null)
}
assert.equal(fridgeBubble(null, 'rug'), null) // still loading / failed

// --- Only B/L/D entries inside the range count; a missing eaten flag is not eaten.
const noisy = week(6)
noisy.days[0].mealsByType.snacks = [entry(false)]
noisy.days[0].mealsByType.extras = [entry(false)]
noisy.days[1].mealsByType.dinner.push({})
noisy.days.push({ date: '2026-10-19', mealsByType: { breakfast: [entry(false)] } })
noisy.days.push({ date: '2026-10-11', mealsByType: { dinner: [entry(true)] } })
assert.deepEqual(fridgeFill(noisy, RANGE), { planned: 22, remaining: 16, pct: 73, filledSlots: 11 })

// A stale week (calendar mid-fetch) must not count as covering the fridge range.
assert.equal(planCoversRange({ days: [{ date: '2026-10-05' }] }, RANGE), false)
assert.equal(planCoversRange({ days: [{ date: RANGE.start }] }, RANGE), true)
assert.equal(planCoversRange({ startDate: RANGE.start, days: [] }, RANGE), true)
assert.equal(planCoversRange(null, RANGE), false)

console.log('fridgeFill: all checks passed')
