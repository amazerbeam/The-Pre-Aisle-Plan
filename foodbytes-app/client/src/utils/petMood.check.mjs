// Run: npm run check:pet   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-14 mood rules
// (AC 6, AC 7) are pinned here. Mirrors mealTimesUtils.check.mjs.
import assert from 'node:assert/strict'
import { derivePetMood, petBubble, petChipLabel, shouldShowPetReaction, petReactionText } from './petMood.js'

const TIMES = { breakfastBy: '11:00', lunchBy: '15:00', dinnerBy: '21:00', custom: false }
const YESTERDAY = '2026-10-12'
const TODAY = '2026-10-13'
const at = (date, hhmm) => {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = hhmm.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}
const entry = (eatenAt = null) => ({ eaten: eatenAt !== null, eatenAt: eatenAt?.toISOString() ?? null })
const day = (date, meals) => ({ date, mealsByType: meals })
const mood = (yesterday, today, now) => derivePetMood({ yesterday, today, mealTimes: TIMES, now })

// Not ready: no meal times or no today → Content, nothing else.
assert.equal(derivePetMood({ yesterday: null, today: null, mealTimes: null, now: at(TODAY, '09:00') }).mood, 'content')

let r

// Malformed meal times (missing / non-string) → same not-ready Content result, no throw.
for (const bad of [{ breakfastBy: '11:00', lunchBy: '15:00' }, { ...TIMES, dinnerBy: null }, { ...TIMES, lunchBy: 1500 }]) {
  r = derivePetMood({ yesterday: null, today: day(TODAY, { lunch: [entry()] }), mealTimes: bad, now: at(TODAY, '16:00') })
  assert.equal(r.mood, 'content')
  assert.equal(r.dueCount, 0)
}

// Content: nothing due, nothing logged today (yesterday all logged doesn't make him Happy).
const yAllLogged = day(YESTERDAY, {
  breakfast: [entry(at(YESTERDAY, '09:00'))], lunch: [entry(at(YESTERDAY, '13:00'))], dinner: [entry(at(YESTERDAY, '20:00'))]
})
const tPlanned = day(TODAY, { breakfast: [entry()], lunch: [entry()], dinner: [entry()] })
r = mood(yAllLogged, tPlanned, at(TODAY, '09:00'))
assert.equal(r.mood, 'content')
assert.equal(r.dueCount, 0)
assert.deepEqual(r.todaySlots.map(s => s.status), ['upcoming', 'upcoming', 'upcoming'])
assert.equal(r.todaySlots[1].byTime, '15:00')

// Happy: breakfast logged today, nothing due.
const tBreakfastLogged = day(TODAY, { breakfast: [entry(at(TODAY, '08:30'))], lunch: [entry()], dinner: [entry()] })
r = mood(yAllLogged, tBreakfastLogged, at(TODAY, '12:00'))
assert.equal(r.mood, 'happy')
assert.equal(r.lastLoggedType, 'breakfast')

// Bored: lunch's time has passed and it isn't ticked.
r = mood(yAllLogged, tBreakfastLogged, at(TODAY, '15:01'))
assert.equal(r.mood, 'bored')
assert.equal(r.dueCount, 1)
assert.equal(r.dueMealType, 'lunch')
assert.equal(r.todaySlots[1].status, 'due')

// Exactly at the "by" time is not yet passed.
assert.equal(mood(yAllLogged, tBreakfastLogged, at(TODAY, '15:00')).mood, 'happy')

// Mischievous: 2+ due, counted across yesterday and today.
const yDinnerMissed = day(YESTERDAY, {
  breakfast: [entry(at(YESTERDAY, '09:00'))], lunch: [entry(at(YESTERDAY, '13:00'))], dinner: [entry()]
})
r = mood(yDinnerMissed, tPlanned, at(TODAY, '11:30'))
assert.equal(r.mood, 'mischievous')
assert.equal(r.dueCount, 2)
assert.equal(r.dueMealType, 'dinner')   // earliest due slot is yesterday's dinner

// AC 7: logging ANY one meal → Happy immediately, even with another still due...
const tBreakfastJustLogged = day(TODAY, { breakfast: [entry(at(TODAY, '11:40'))], lunch: [entry()], dinner: [entry()] })
r = mood(yDinnerMissed, tBreakfastJustLogged, at(TODAY, '11:41'))
assert.equal(r.mood, 'happy')
assert.equal(r.dueCount, 1)
// ...until the next meal time passes: yesterday's dinner + today's lunch → Mischievous.
assert.equal(mood(yDinnerMissed, tBreakfastJustLogged, at(TODAY, '15:01')).mood, 'mischievous')

// Per slot: two unticked lunch recipes are ONE due meal; one ticked recipe logs the slot.
const tTwoLunches = day(TODAY, { breakfast: [entry(at(TODAY, '08:00'))], lunch: [entry(), entry()] })
assert.equal(mood(null, tTwoLunches, at(TODAY, '16:00')).dueCount, 1)
const tOneOfTwoTicked = day(TODAY, { lunch: [entry(), entry(at(TODAY, '13:00'))] })
assert.equal(mood(null, tOneOfTwoTicked, at(TODAY, '16:00')).todaySlots[1].status, 'logged')

// Snacks and extras never count; unplanned slots are never due.
const tSnacksOnly = day(TODAY, { snacks: [entry()], extras: [entry()] })
r = mood(null, tSnacksOnly, at(TODAY, '22:00'))
assert.equal(r.mood, 'content')
assert.deepEqual(r.todaySlots.map(s => s.status), ['unplanned', 'unplanned', 'unplanned'])

// Custom (owner's) meal times are honoured.
const early = { breakfastBy: '08:00', lunchBy: '12:00', dinnerBy: '18:00', custom: true }
assert.equal(derivePetMood({ yesterday: null, today: tPlanned, mealTimes: early, now: at(TODAY, '08:01') }).mood, 'bored')

// AC 7 reaction: eaten breakfast/lunch/dinner only (mealType is lowercase on the wire).
assert.equal(shouldShowPetReaction({ eaten: true, mealType: 'lunch' }), true)
assert.equal(shouldShowPetReaction({ eaten: true, mealType: 'breakfast' }), true)
assert.equal(shouldShowPetReaction({ eaten: true, mealType: 'dinner' }), true)
assert.equal(shouldShowPetReaction({ eaten: false, mealType: 'lunch' }), false)
assert.equal(shouldShowPetReaction({ eaten: true, mealType: 'snacks' }), false)
assert.equal(shouldShowPetReaction({ eaten: true, mealType: 'extras' }), false)
assert.equal(petReactionText({ petName: 'Pip', mealType: 'lunch' }), 'Pip is happy! Lunch logged.')

// Copy.
assert.equal(petBubble({ mood: 'content' }), 'Nothing due yet. Just vibing.')
assert.equal(petBubble({ mood: 'happy', lastLoggedType: 'lunch' }), 'Lunch logged! Nap time.')
assert.equal(petBubble({ mood: 'happy', lastLoggedType: null }), 'All caught up! Nap time.')
assert.equal(petBubble({ mood: 'bored', dueMealType: 'lunch' }), "Did lunch happen? I'm getting bored...")
assert.equal(petBubble({ mood: 'mischievous' }), "I didn't touch the takeaway. Log a meal and it never happened.")
assert.equal(petChipLabel({ mood: 'happy', dueCount: 0 }), 'Happy')
assert.equal(petChipLabel({ mood: 'bored', dueCount: 1 }), 'Bored · 1 unlogged')
assert.equal(petChipLabel({ mood: 'mischievous', dueCount: 3 }), 'Mischievous · 3 unlogged')

console.log('petMood: all checks passed')
