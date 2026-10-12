// Run: node src/utils/mealTimesUtils.check.mjs   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-13 order
// rule is pinned here. Mirrors servingsUtils.check.mjs.
import assert from 'node:assert/strict'
import { isStrictlyOrdered, pickMealTimes } from './mealTimesUtils.js'

const t = (breakfastBy, lunchBy, dinnerBy) => ({ breakfastBy, lunchBy, dinnerBy })

// The defaults are in order.
assert.equal(isStrictlyOrdered(t('11:00', '15:00', '21:00')), true)
// Strict: equal times fail.
assert.equal(isStrictlyOrdered(t('12:00', '12:00', '19:00')), false)
// Out of order fails, including no wrap past midnight.
assert.equal(isStrictlyOrdered(t('13:00', '12:00', '19:00')), false)
assert.equal(isStrictlyOrdered(t('09:00', '13:00', '00:30')), false)
// Zero-padding matters: '9:30' is not HH:mm (the backend 400s it too).
assert.equal(isStrictlyOrdered(t('9:30', '13:00', '19:00')), false)
// Missing values fail.
assert.equal(isStrictlyOrdered(t('09:00', '', '19:00')), false)
assert.equal(isStrictlyOrdered(null), false)

// pickMealTimes drops `custom` and tolerates a missing object.
assert.deepEqual(pickMealTimes({ ...t('08:00', '12:00', '18:00'), custom: true }), t('08:00', '12:00', '18:00'))
assert.deepEqual(pickMealTimes(undefined), t('', '', ''))

console.log('mealTimesUtils: all checks passed')
