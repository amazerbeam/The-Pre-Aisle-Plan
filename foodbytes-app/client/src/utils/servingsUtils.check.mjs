// Run: node src/utils/servingsUtils.check.mjs   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the starting-servings
// decision — the one place MPP-3 AC 4, 6 and 9 meet — is pinned here instead.
// Mirrors macroStatus.check.mjs.
import assert from 'node:assert/strict'
import { resolveStartingServings } from './servingsUtils.js'

const meal = { defaultServings: 2, mealTypes: ['dinner'] }
const extra = { defaultServings: 4, mealTypes: ['extras'] }
const extraTitleCase = { defaultServings: 4, mealTypes: ['Extras'] }
const dualPurpose = { defaultServings: 2, mealTypes: ['extras', 'dinner'] }

// AC 9 — no preference set: unchanged behaviour, the recipe's own default.
assert.equal(resolveStartingServings(meal, null), 2)
assert.equal(resolveStartingServings(meal, undefined), 2)
assert.equal(resolveStartingServings(meal, ''), 2)

// AC 4 — preference set: the meal recipe starts at the preference.
assert.equal(resolveStartingServings(meal, 1), 1)
assert.equal(resolveStartingServings(meal, '1'), 1)
assert.equal(resolveStartingServings(meal, 0.5), 0.5)
assert.equal(resolveStartingServings(meal, 3.25), 3.25)

// AC 6 — extras are exempt in both casings the API can return.
assert.equal(resolveStartingServings(extra, 1), 4)
assert.equal(resolveStartingServings(extraTitleCase, 1), 4)

// A recipe that is BOTH an extra and a dinner is a meal — the preference applies.
assert.equal(resolveStartingServings(dualPurpose, 1), 1)

// Unusable preferences fall back rather than producing NaN.
assert.equal(resolveStartingServings(meal, 'abc'), 2)
assert.equal(resolveStartingServings(meal, NaN), 2)

// Out-of-range preferences are clamped by parseServings, not rejected.
assert.equal(resolveStartingServings(meal, 0.1), 0.25)
assert.equal(resolveStartingServings(meal, 999), 20)

// Missing recipe data degrades to DEFAULT_SERVINGS rather than NaN.
assert.equal(resolveStartingServings(null, null), 1)
assert.equal(resolveStartingServings({}, null), 1)
assert.equal(resolveStartingServings({ mealTypes: ['dinner'] }, null), 1)

console.log('servingsUtils.check.mjs: all assertions passed')
