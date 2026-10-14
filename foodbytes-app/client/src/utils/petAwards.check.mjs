// Run: npm run check:awards   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-23 cabinet rules
// (AC 2–5) are pinned here. Mirrors habitCheckIn.check.mjs.
import assert from 'node:assert/strict'
import {
  announcementText, awardCount, awardCountsOf, firstsList, newAwards, nextLine, orderStreaks, streakLine
} from './petAwards.js'

const zeros = { 1: 0, 3: 0, 5: 0, 7: 0, 14: 0, 21: 0, 30: 0 }
const status = (streakType, counts, extra = {}) => ({
  streakType, current: 0, best: 0, counts: { '1': 0, '3': 0, '5': 0, '7': 0, '14': 0, '21': 0, '30': 0, ...counts },
  next: { milestone: 1, inDays: 1 }, ...extra
})

// orderStreaks — PLAN, SNACK, ALCOHOL regardless of input order; unknown dropped
assert.deepEqual(
  orderStreaks([status('ALCOHOL', {}), status('BOGUS', {}), status('PLAN', {}), status('SNACK', {})]).map(s => s.streakType),
  ['PLAN', 'SNACK', 'ALCOHOL'])
assert.deepEqual(orderStreaks(null), [])

// awardCount — string keys from JSON; missing / negative / junk → 0
assert.equal(awardCount(status('PLAN', { '7': 2 }), 7), 2)
assert.equal(awardCount(status('PLAN', {}), 30), 0)
assert.equal(awardCount({ counts: { '3': -1 } }, 3), 0)
assert.equal(awardCount({ counts: { '3': 'x' } }, 3), 0)
assert.equal(awardCount(undefined, 1), 0)

// AC 2: streak and next lines
assert.equal(streakLine({ current: 4, best: 9 }), 'Now 4 days · best 9')
assert.equal(streakLine({ current: 1, best: 1 }), 'Now 1 day · best 1')
assert.equal(streakLine({ current: 0, best: 0 }), 'Now 0 days · best 0')
assert.equal(nextLine({ milestone: 5, inDays: 2 }), 'next: 5 days in 2 days')
assert.equal(nextLine({ milestone: 7, inDays: 1 }), 'next: 1 week in 1 day')
assert.equal(nextLine({ milestone: 30, inDays: 9 }), 'next: 1 month in 9 days')
assert.equal(nextLine(null), null)

// awardCountsOf — all 7 milestones per type, numbers
assert.deepEqual(awardCountsOf([status('SNACK', { '1': 3, '7': 1 })]), { SNACK: { ...zeros, 1: 3, 7: 1 } })

// AC 5: newAwards
const before = awardCountsOf([status('PLAN', { '1': 1 }), status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 1 }), status('ALCOHOL', {})])
assert.deepEqual(newAwards(null, [status('PLAN', { '1': 5 })]), []) // first visit: silent
assert.deepEqual(newAwards(before, [status('PLAN', { '1': 1 }), status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 1 })]), []) // nothing rose
assert.deepEqual( // snack 7 rose to 2 → one announcement
  newAwards(before, [status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 2 })]),
  [{ streakType: 'SNACK', milestone: 7, count: 2 }])
assert.deepEqual( // several plan milestones at once → only the highest; types in shelf order
  newAwards(before, [status('ALCOHOL', { '1': 1 }), status('PLAN', { '1': 2, '3': 1, '5': 1 })]),
  [{ streakType: 'PLAN', milestone: 5, count: 1 }, { streakType: 'ALCOHOL', milestone: 1, count: 1 }])
assert.deepEqual(newAwards({ PLAN: { 1: 3 } }, [status('PLAN', { '1': 2 })]), []) // a drop is never "new"
assert.deepEqual(newAwards({}, [status('SNACK', { '1': 1 })]), [{ streakType: 'SNACK', milestone: 1, count: 1 }]) // type absent from baseline
assert.deepEqual( // a baseline read back from JSON has string keys
  newAwards(JSON.parse(JSON.stringify(before)), [status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 2 })]),
  [{ streakType: 'SNACK', milestone: 7, count: 2 }])

// AC 5: announcement wording (ticket example verbatim)
assert.equal(announcementText({ streakType: 'SNACK', milestone: 7, count: 2 }), '🎉 New ribbon: 1 week snack-free (×2)!')
assert.equal(announcementText({ streakType: 'PLAN', milestone: 3, count: 1 }), '🎉 New trophy: 3 days following the plan!')
assert.equal(announcementText({ streakType: 'ALCOHOL', milestone: 30, count: 4 }), '🎉 New ribbon: 1 month alcohol-free (×4)!')

// AC 4: firsts — FirstKey order, earned from earnedAt, missing → to do
assert.deepEqual(firstsList([
  { key: 'PLAN_FULL_WEEK', earnedAt: '2026-01-07T21:33:10Z' },
  { key: 'MAKE_TEMPLATE', earnedAt: null }
]), [
  { key: 'MAKE_TEMPLATE', label: 'Make a template', earned: false },
  { key: 'GENERATE_SHOPPING_LIST', label: 'Generate a shopping list', earned: false },
  { key: 'PLAN_FULL_WEEK', label: 'Plan a full week', earned: true },
  { key: 'COOK_HOMEMADE_EXTRA', label: 'Cook a homemade extra', earned: false }
])
assert.equal(firstsList(undefined).length, 4)

console.log('award checks passed')
