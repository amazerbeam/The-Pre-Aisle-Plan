// Run: npm run check:pip   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-17 routine rules
// (AC 2, AC 3) are pinned here. Mirrors petMood.check.mjs.
import assert from 'node:assert/strict'
import { pipPosition } from './pipPosition.js'

const TIMES = { breakfastBy: '08:00', lunchBy: '13:00', dinnerBy: '19:00', custom: false }
const at = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2026, 9, 13, h, m)
}
const expectAt = (times, cases) => {
  for (const [hhmm, expected] of Object.entries(cases)) {
    assert.equal(pipPosition(at(hhmm), times), expected, `${hhmm} with ${JSON.stringify(times)}`)
  }
}

// AC 3, verbatim.
expectAt(TIMES, { '12:45': 'cooker', '15:00': 'rug', '23:00': 'bed', '06:30': 'bed', '07:15': 'rug' })

// AC 2 cooker window: inclusive at both ends, around every meal.
expectAt(TIMES, {
  '07:29': 'rug', '07:30': 'cooker', '08:00': 'cooker', '08:30': 'cooker', '08:31': 'rug',
  '12:30': 'cooker', '13:30': 'cooker', '13:31': 'rug',
  '18:29': 'rug', '18:30': 'cooker', '19:30': 'cooker', '19:31': 'rug'
})

// AC 2 bed window: from dinner + 3 h (inclusive) to breakfast − 1 h (exclusive), across midnight.
expectAt(TIMES, { '21:59': 'rug', '22:00': 'bed', '00:00': 'bed', '03:00': 'bed', '06:59': 'bed', '07:00': 'rug' })

// A late dinner's cooker window crosses midnight; bed still starts dinner + 3 h.
expectAt({ breakfastBy: '08:00', lunchBy: '13:00', dinnerBy: '23:45' }, {
  '23:15': 'cooker', '00:10': 'cooker', '00:15': 'cooker', '00:16': 'rug', '02:44': 'rug', '02:45': 'bed', '06:59': 'bed', '07:00': 'rug'
})

// Degenerate: dinner + 3 h is after breakfast − 1 h, so Pip never sleeps (not "asleep all day").
expectAt({ breakfastBy: '02:30', lunchBy: '12:00', dinnerBy: '23:00' }, { '01:30': 'rug', '03:30': 'rug', '15:00': 'rug' })

// Seconds on the wire are tolerated.
expectAt({ breakfastBy: '08:00:00', lunchBy: '13:00:00', dinnerBy: '19:00:00' }, { '08:10': 'cooker', '23:00': 'bed' })

// Missing or malformed meal times → rug, never a throw (PetProvider has no error boundary).
for (const bad of [
  null,
  undefined,
  {},
  { breakfastBy: '08:00', lunchBy: '13:00' },
  { ...TIMES, dinnerBy: null },
  { ...TIMES, lunchBy: 1300 },
  { ...TIMES, lunchBy: '25:00' },
  { ...TIMES, lunchBy: '13:60' },
  { ...TIMES, lunchBy: 'soon' }
]) {
  assert.equal(pipPosition(at('12:45'), bad), 'rug', JSON.stringify(bad))
}

console.log('pip position checks passed')
