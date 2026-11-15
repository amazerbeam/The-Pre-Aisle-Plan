// Run: npm run check:growth   (from foodbytes-app/client)
//
// No test runner is wired into client/package.json, so the client-side growth rules (MPP-31 AC 5, 7,
// 8, 9, and the themed Pip lines) are pinned here. Mirrors petMood.check.mjs.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  GROWTH_CHANGES, barPct, evolvedLine, growthBubble, growthChange, growthGain, growthSchedule, growthView, isWilted,
  levelBarLabel, lineGrowth
} from './pipGrowth.js'
import { HEAD_BAR_GAIN_DELTA_MS, HEAD_BAR_GAIN_MS, PIP_GROWTH_PHASES } from '../constants/pipGrowth.js'
import { PIP_LINE, PIP_LINE_COPY } from '../constants/pipLines.js'
import { PIP_ANIMATION_MAX_MS } from '../constants/pet.js'
import { lineFormCount } from '../components/pet/pip/lineForms.js'

const lineOf = (form, formStart, barCurrent, barSize, fullyGrown = false) => ({ form, peakForm: form, formStart, barCurrent, barSize, fullyGrown })
const dto = (over = {}) => ({
  points: 21,
  lastDayScore: 3,
  lastScoredDate: '2026-11-14',
  peakForm: 2,
  lines: { herb: lineOf(2, 15, 6, 21), dragon: lineOf(2, 15, 6, 21), robot: lineOf(2, 15, 6, 21) },
  ...over
})
const g = (over = {}, line = 'herb') => ({ ...lineGrowth(dto(), line), ...over })
const BASILISK = g({ points: 90, form: 5, formStart: 90, barCurrent: null, barSize: null, fullyGrown: true })
const FULL = { form: 3, barCurrent: null, barSize: null, fullyGrown: true }

// AC 5: label and pct
assert.equal(levelBarLabel(g(), 'herb'), 'Seedling · 6 / 21 → Sprig')
assert.equal(levelBarLabel(BASILISK, 'herb'), 'Fully grown 🌸')
assert.equal(levelBarLabel(null, 'herb'), null)
assert.equal(barPct(g()), 29)
assert.equal(barPct(BASILISK), 100)
assert.equal(barPct(null), 0)

// AC 7: wilted only when the latest scored day is a slip
assert.equal(isWilted(g({ lastDayScore: -3 })), true)
assert.equal(isWilted(g()), false)
assert.equal(isWilted(null), false)

// Projection
assert.equal(lineGrowth(dto(), 'dragon').form, 2)
assert.equal(lineGrowth(dto(), 'unknown').form, 2, 'unknown line falls back to herb')
assert.equal(lineGrowth({ points: 3, form: 2 }, 'herb'), null, 'legacy payload has no lines')

// Labels per line
assert.equal(levelBarLabel(g({}, 'dragon'), 'dragon'), 'Wyrmling · 6 / 21 → Drake')
assert.equal(levelBarLabel(g({}, 'robot'), 'robot'), 'Teen Unit · 6 / 21 → Android')
assert.equal(levelBarLabel(g(FULL, 'dragon'), 'dragon'), 'Fully grown 🐉')
assert.equal(levelBarLabel(g(FULL, 'robot'), 'robot'), 'Fully upgraded ⚙️')

// Below the form's start: empty bar, real points over the start
const below = g({ points: 12, barCurrent: 0 }, 'dragon')
assert.equal(barPct(below), 0)
assert.equal(levelBarLabel(below, 'dragon'), 'Wyrmling · 12 / 15')
assert.equal(growthGain(g(), below, growthSchedule(GROWTH_CHANGES.MOVE, false)).count, '12 / 15')

// Changes since the last visit
assert.equal(growthChange(null, g()), null, 'first visit plays nothing')
assert.equal(growthChange(g(), g()), null)
assert.equal(growthChange(g({ form: 1, points: 12 }), g()), GROWTH_CHANGES.EVOLVE)
assert.equal(growthChange(g({ points: 24 }), g({ lastDayScore: -3, lastScoredDate: '2026-10-14' })), GROWTH_CHANGES.SLIP)
assert.equal(growthChange(g({ points: 18 }), g()), GROWTH_CHANGES.MOVE)

// Never shrink: a lower form is a MOVE with a single revealed step
assert.equal(growthChange(g({ form: 3 }), g({ form: 2 })), GROWTH_CHANGES.MOVE)
assert.deepEqual(growthSchedule(GROWTH_CHANGES.MOVE, false).map(s => s.phase), ['revealed'])
assert.equal(Object.values(GROWTH_CHANGES).includes('devolve'), false)

// AC 8: schedules; reduced motion keeps the bubbles only
assert.deepEqual(growthSchedule(GROWTH_CHANGES.EVOLVE, false).map(s => s.phase), ['filling', 'evolving', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.EVOLVE, true).map(s => s.phase), ['evolving', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.SLIP, false).map(s => s.phase), ['revealed'])

// AC 5: the bar fills to full before evolving, starts empty after, then settles
const seed = g({ points: 12, form: 1, formStart: 0, barCurrent: 12, barSize: 15 })
assert.deepEqual(growthView(null, seed, g(), 'herb'), { form: 1, pct: 80, label: 'Basil seed · 12 / 15 → Seedling' })
assert.equal(growthView('filling', seed, g(), 'herb').pct, 100)
assert.deepEqual(growthView('evolving', seed, g(), 'herb'), { form: 2, pct: 0, label: 'Seedling · 6 / 21 → Sprig' })
assert.equal(growthView('revealed', seed, g(), 'herb').pct, 29)

// AC 8 / AC 9: bubbles, with the pet's own name and the line's voice
const bubble = (change, phase, seen, growth, line = 'herb') => growthBubble({ change, phase, petName: 'Basil', seen, growth, line })
assert.equal(bubble('evolve', 'evolving', seed, g()), 'What? Basil is evolving!')
assert.equal(bubble('evolve', 'revealed', g({ form: 2 }), g({ form: 3 })), 'Basil evolved into Sprig! 🌱')
assert.equal(bubble('evolve', 'revealed', g({ form: 4 }), BASILISK), "I'm fully grown! 🌸 Thank you for looking after me.")
assert.equal(bubble('slip', 'revealed', g(), g()), "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!")
assert.equal(bubble('move', 'revealed', g(), g()), null)
assert.equal(bubble('evolve', 'filling', seed, g()), null)
assert.equal(evolvedLine('Pip', 'dragon', 3), 'Pip evolved into Drake! 🐉')
assert.equal(growthBubble({ change: GROWTH_CHANGES.SLIP, phase: 'revealed', petName: 'Pip', seen: g(), growth: g(), line: 'robot' }), PIP_LINE_COPY.robot.slipLine)
assert.equal(
  growthBubble({ change: GROWTH_CHANGES.EVOLVE, phase: 'revealed', petName: 'Pip', seen: g(), growth: g({ form: 3, fullyGrown: true }), line: 'dragon' }),
  PIP_LINE_COPY.dragon.fullyGrownLine
)

// MPP-29 AC 2: the animated part of a stage change (everything before the revealed hold, which is
// bubble reading time) stays within PIP_ANIMATION_MAX_MS, with and without reduced motion.
const animatedMs = (steps) => steps
  .filter(({ phase }) => phase !== PIP_GROWTH_PHASES.REVEALED)
  .reduce((sum, { ms }) => sum + ms, 0)
for (const reduced of [false, true]) {
  assert.ok(animatedMs(growthSchedule(GROWTH_CHANGES.EVOLVE, reduced)) <= PIP_ANIMATION_MAX_MS, 'evolve over the 3 s limit')
}

// The points pop over the bar
const moveSteps = growthSchedule(GROWTH_CHANGES.MOVE, false)
assert.deepEqual(growthGain(g({ points: 18, barCurrent: 3 }), g(), moveSteps), { text: '+3', gained: true, count: '6 / 21', delayMs: 0 })
assert.deepEqual(growthGain(g(), g({ points: 18, barCurrent: 3 }), moveSteps), { text: '−3', gained: false, count: '3 / 21', delayMs: 0 })
assert.equal(growthGain(g(), g({ lastDayScore: -3 }), moveSteps), null, 'a floored slip moves no points')
assert.equal(growthGain(g({ form: 1, points: 12 }), g(), growthSchedule(GROWTH_CHANGES.EVOLVE, false)).delayMs, 2500, 'count waits for the evolve')
assert.equal(growthGain(g({ form: 4, points: 87 }), BASILISK, growthSchedule(GROWTH_CHANGES.EVOLVE, false)), null, 'no pop into the last form — the bar goes away')
assert.equal(growthGain(BASILISK, g({ form: 4, points: 87 }), moveSteps), null, 'no pop out of the last form')

// pip-gain-count stays hidden for its first ~half, so the +3 must be gone by then.
assert.ok(HEAD_BAR_GAIN_DELTA_MS <= HEAD_BAR_GAIN_MS / 2, 'the +3 would overlap the count')

// Client form counts and names agree with the server's PetGrowthPolicy.Line thresholds
const java = readFileSync(new URL('../../../foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java', import.meta.url), 'utf8')
for (const line of Object.values(PIP_LINE)) {
  const match = java.match(new RegExp(`${line.toUpperCase()}\\("${line}", List\\.of\\(([^)]*)\\)`))
  assert.ok(match, `server has no ${line} line`)
  const serverForms = match[1].split(',').length
  assert.equal(lineFormCount(line), serverForms, `${line}: client draws ${lineFormCount(line)} forms, server has ${serverForms} thresholds`)
  assert.equal(Object.keys(PIP_LINE_COPY[line].formNames).length, serverForms, `${line}: one name per server form`)
}

console.log('pipGrowth checks passed')
