// Run: npm run check:growth   (from foodbytes-app/client)
//
// No test runner is wired into client/package.json, so MPP-31's client-side growth rules
// (AC 5, 7, 8, 9) are pinned here. Mirrors petMood.check.mjs.
import assert from 'node:assert/strict'
import {
  GROWTH_CHANGES, barPct, growthBubble, growthChange, growthSchedule, growthView, isWilted, levelBarLabel
} from './pipGrowth.js'
import { PIP_GROWTH_PHASES } from '../constants/pipGrowth.js'
import { PIP_ANIMATION_MAX_MS } from '../constants/pet.js'

const g = (over) => ({ points: 21, form: 2, barCurrent: 6, barSize: 21, fullyGrown: false, lastDayScore: 3, lastScoredDate: '2026-10-13', ...over })
const BASILISK = g({ points: 90, form: 5, barCurrent: null, barSize: null, fullyGrown: true })

// AC 5: label and pct
assert.equal(levelBarLabel(g()), 'Seedling · 6 / 21 → Sprig')
assert.equal(levelBarLabel(BASILISK), 'Fully grown 🌸')
assert.equal(levelBarLabel(null), null)
assert.equal(barPct(g()), 29)
assert.equal(barPct(BASILISK), 100)
assert.equal(barPct(null), 0)

// AC 7: wilted only when the latest scored day is a slip
assert.equal(isWilted(g({ lastDayScore: -3 })), true)
assert.equal(isWilted(g()), false)
assert.equal(isWilted(null), false)

// Changes since the last visit
assert.equal(growthChange(null, g()), null, 'first visit plays nothing')
assert.equal(growthChange(g(), g()), null)
assert.equal(growthChange(g({ form: 1, points: 12 }), g()), GROWTH_CHANGES.EVOLVE)
assert.equal(growthChange(g(), g({ form: 1, points: 12 })), GROWTH_CHANGES.DEVOLVE)
assert.equal(growthChange(g({ points: 24 }), g({ lastDayScore: -3, lastScoredDate: '2026-10-14' })), GROWTH_CHANGES.SLIP)
assert.equal(growthChange(g({ points: 18 }), g()), GROWTH_CHANGES.MOVE)

// AC 8: schedules; reduced motion keeps the bubbles only
assert.deepEqual(growthSchedule(GROWTH_CHANGES.EVOLVE, false).map(s => s.phase), ['filling', 'evolving', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.EVOLVE, true).map(s => s.phase), ['evolving', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.DEVOLVE, false).map(s => s.phase), ['draining', 'shrinking', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.DEVOLVE, true).map(s => s.phase), ['revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.SLIP, false).map(s => s.phase), ['revealed'])

// AC 5: the bar fills to full before evolving, starts empty after, then settles
const seed = g({ points: 12, form: 1, barCurrent: 12, barSize: 15 })
assert.deepEqual(growthView(null, seed, g()), { form: 1, pct: 80, label: 'Basil seed · 12 / 15 → Seedling' })
assert.equal(growthView('filling', seed, g()).pct, 100)
assert.deepEqual(growthView('evolving', seed, g()), { form: 2, pct: 0, label: 'Seedling · 6 / 21 → Sprig' })
assert.equal(growthView('revealed', seed, g()).pct, 29)
// …and runs below empty before de-evolving, then the previous form's bar shows nearly full
const back = g({ points: 12, form: 1, barCurrent: 12, barSize: 15 })
assert.equal(growthView('draining', g(), back).pct, 0)
assert.deepEqual(growthView('shrinking', g(), back), { form: 1, pct: 100, label: 'Basil seed · 12 / 15 → Seedling' })
assert.equal(growthView('revealed', g(), back).pct, 80)

// AC 8 / AC 9: bubbles, with the pet's own name
const bubble = (change, phase, seen, growth) => growthBubble({ change, phase, petName: 'Basil', seen, growth })
assert.equal(bubble('evolve', 'evolving', seed, g()), 'What? Basil is evolving!')
assert.equal(bubble('evolve', 'revealed', g({ form: 2 }), g({ form: 3 })), 'Basil evolved into Sprig! 🌱')
assert.equal(bubble('evolve', 'revealed', g({ form: 4 }), BASILISK), "I'm fully grown! 🌸 Thank you for looking after me.")
assert.equal(bubble('devolve', 'revealed', g(), back), "I shrank back to Basil seed 🌱 A few good days and I'll grow again!")
assert.equal(bubble('slip', 'revealed', g(), g()), "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!")
assert.equal(bubble('move', 'revealed', g(), g()), null)
assert.equal(bubble('evolve', 'filling', seed, g()), null)

// MPP-29 AC 2: the animated part of a stage change (everything before the revealed hold, which is
// bubble reading time) stays within PIP_ANIMATION_MAX_MS, with and without reduced motion.
const animatedMs = (steps) => steps
  .filter(({ phase }) => phase !== PIP_GROWTH_PHASES.REVEALED)
  .reduce((sum, { ms }) => sum + ms, 0)
for (const change of [GROWTH_CHANGES.EVOLVE, GROWTH_CHANGES.DEVOLVE]) {
  for (const reduced of [false, true]) {
    assert.ok(animatedMs(growthSchedule(change, reduced)) <= PIP_ANIMATION_MAX_MS, `${change} over the 3 s limit`)
  }
}

console.log('pipGrowth checks passed')
