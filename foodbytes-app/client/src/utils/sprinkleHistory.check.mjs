// Run: npm run check:sprinkles   (from foodbytes-app/client)
//
// No test runner is wired into client/package.json, so MPP-42's grouping, wording, good-week maths,
// count-up duration and Pip's earned line are pinned here. Mirrors pipBubble.check.mjs.
import assert from 'node:assert/strict'
import { countUpDuration, earnedLine, goodWeek, groupRecent, relativeDay, weekRange } from './sprinkleHistory.js'

const RATES = { mealEaten: 10, onTimeBonus: 5, homemadeBonus: 5, fullWeek: 20, shoppingListGenerated: 10, shoppingListCompleted: 15, mealsPerWeek: 21 }
const at = (iso) => `${iso}T12:00:00Z`
const meal = (sourceType, entryId, amount, mealKey = 'breakfast', day = '2026-10-15') =>
  ({ sourceType, entryId, amount, mealKey, planDate: day, createdAt: at(day) })

// AC 4: 210 + 105 + 20 + 25 = 360
assert.deepEqual(goodWeek(RATES), { mealCount: 21, meals: 210, onTime: 105, fullWeek: 20, shopping: 25, total: 360 })

// AC 5: one meal's three rows → one line; newest first is kept.
const grouped = groupRecent([
  meal('HOMEMADE_EXTRA', 1, 5), meal('MEAL_ON_TIME', 1, 5), meal('MEAL_EATEN', 1, 10),
  meal('MEAL_EATEN', 2, 10, 'dinner', '2026-10-14'),
  { sourceType: 'SHOPPING_LIST_COMPLETED', amount: 15, weekStart: '2026-10-12', createdAt: at('2026-10-14') },
  { sourceType: 'STATION_UPGRADE', amount: -300, station: 'fridge', level: 2, createdAt: at('2026-10-14') },
  { sourceType: 'DECOR_PURCHASE', amount: -120, decorItem: 'herb-shelf', createdAt: at('2026-10-13') },
  { sourceType: 'DECOR_PURCHASE', amount: -80, decorItem: 'floor-oak', createdAt: at('2026-10-13') },
  { sourceType: 'FULL_WEEK', amount: 20, weekStart: '2026-10-13', createdAt: at('2026-10-12') },
  { sourceType: 'DECOR_PURCHASE', amount: -50, decorItem: null, createdAt: at('2026-10-12') }
])
assert.deepEqual(grouped.map(l => [l.text, l.amount]), [
  ['Breakfast eaten · on time · homemade', 20],
  ['Dinner eaten', 10],
  ['Shopping finished', 15],
  ['Bought the Mini fridge', -300],
  ['Bought the Herb shelf', -120],
  ['Bought the Oak boards floor', -80],
  ['Full week planned (13–19 Oct)', 20],
  ['Shop purchase', -50]
])
assert.equal(new Set(grouped.map(l => l.key)).size, grouped.length) // unique React keys

// A week that spans two months.
assert.equal(weekRange('2026-09-28'), '28 Sep – 4 Oct')

// Relative days against a local "today".
assert.equal(relativeDay(at('2026-10-15'), '2026-10-15'), 'Today')
assert.equal(relativeDay(at('2026-10-14'), '2026-10-15'), 'Yesterday')
assert.equal(relativeDay(at('2026-10-11'), '2026-10-15'), 'Sun')
assert.equal(relativeDay(at('2026-10-03'), '2026-10-15'), '3 Oct')

// AC 15: 0.7 s floor, 6 ms per sprinkle, 1.6 s ceiling.
assert.equal(countUpDuration(1), 706)
assert.equal(countUpDuration(35), 910)
assert.equal(countUpDuration(500), 1600)

// AC 16: Pip's line, from the newest earnings that add up to the gain (spends are skipped).
const recent = [
  meal('MEAL_ON_TIME', 9, 5, 'lunch'), meal('MEAL_EATEN', 9, 10, 'lunch'),
  { sourceType: 'STATION_UPGRADE', amount: -300, station: 'bed', level: 2, createdAt: at('2026-10-15') },
  meal('MEAL_ON_TIME', 8, 5), meal('MEAL_EATEN', 8, 10),
  meal('MEAL_EATEN', 7, 10, 'dinner', '2026-10-14')
]
assert.equal(earnedLine(recent, 30), '+30: 2 meals, both on time ✨')
assert.equal(earnedLine(recent, 15), '+15: a meal, on time ✨')
assert.equal(earnedLine(recent, 40), '+40: 3 meals, 2 on time ✨')
assert.equal(earnedLine([meal('MEAL_EATEN', 3, 10), meal('MEAL_EATEN', 4, 10)], 20), '+20: 2 meals ✨')
assert.equal(earnedLine([
  { sourceType: 'SHOPPING_LIST_COMPLETED', amount: 15, weekStart: '2026-10-12', createdAt: at('2026-10-15') },
  { sourceType: 'FULL_WEEK', amount: 20, weekStart: '2026-10-12', createdAt: at('2026-10-15') },
  { sourceType: 'SHOPPING_LIST_GENERATED', amount: 10, weekStart: '2026-10-12', createdAt: at('2026-10-15') }
], 45), '+45! Full week + shopping 🛒✨')
assert.equal(earnedLine([
  { sourceType: 'FULL_WEEK', amount: 20, weekStart: '2026-10-12', createdAt: at('2026-10-15') }, meal('MEAL_EATEN', 5, 10)
], 30), '+30! Full week + a meal ✨')
assert.equal(earnedLine([], 12), '+12 sprinkles! ✨')

console.log('sprinkleHistory: all checks passed')
