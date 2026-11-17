/**
 * FR-050: verification for the day-kcal projection on recipe-card day buttons.
 * No frontend test runner exists; run with: cd foodbytes-app/client && npm run check:daykcal
 * Pins the three click outcomes (add, swap, remove) so the preview always matches
 * what the optimistic update in MealPlanContext.assignRecipe will show after the click.
 */
import assert from 'node:assert/strict'
import { DAY_KCAL_EMPTY, entryKcalPerServing, formatDayKcal, projectDayKcal } from './dayKcal.js'

const entry = (id, calories, defaultServings) => ({ recipe: { id, calories, defaultServings } })

// per-serving kcal
assert.equal(entryKcalPerServing(entry(1, 1222, 2)), 611)
assert.equal(entryKcalPerServing(entry(1, 600, 0)), 600, 'defaultServings 0 divides by 1')
assert.equal(entryKcalPerServing(undefined), 0)

// add to an empty slot
assert.equal(projectDayKcal({ dayTotal: 1215, slotEntries: [], assignId: 7, assignKcal: 611 }), 1826)
// swap: another recipe holds the slot
assert.equal(projectDayKcal({ dayTotal: 1822, slotEntries: [entry(5, 1284, 2)], assignId: 7, assignKcal: 611 }), 1791)
// remove: this recipe is already there
assert.equal(projectDayKcal({ dayTotal: 1716, slotEntries: [entry(7, 1222, 2)], assignId: 7, assignKcal: 611 }), 1105)
// empty day, nothing missing
assert.equal(projectDayKcal({ dayTotal: undefined, slotEntries: undefined, assignId: 7, assignKcal: 504 }), 504)
// never negative, always an integer
assert.equal(projectDayKcal({ dayTotal: 100, slotEntries: [entry(7, 1222, 2)], assignId: 7, assignKcal: 611 }), 0)
assert.equal(projectDayKcal({ dayTotal: 0, slotEntries: [], assignId: 7, assignKcal: 503.6 }), 504)
console.log('✓ projectDayKcal: add, swap, remove, empty, floor')

// formatting
assert.equal(formatDayKcal(1834.6), '1835')
assert.equal(formatDayKcal(0), DAY_KCAL_EMPTY)
assert.equal(formatDayKcal(undefined), DAY_KCAL_EMPTY)
assert.equal(formatDayKcal(12345), '12345', 'no thousands separator')
console.log('✓ formatDayKcal')

console.log('\nAll day-kcal checks passed.')
