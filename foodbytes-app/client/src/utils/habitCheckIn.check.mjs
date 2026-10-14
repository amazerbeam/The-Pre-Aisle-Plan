// Run: npm run check:checkin   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-21 check-in rules
// (AC 1–4) are pinned here. Mirrors fridgeFill.check.mjs. 2026-10-13 is a Tuesday.
import assert from 'node:assert/strict'
import {
  daysBetweenISO, habitsToAsk, isSnoozedToday, praiseText, questionText, sinceText, startOverText
} from './habitCheckIn.js'
import { CHECKIN_THANKS } from '../constants/pet.js'

// daysBetweenISO — across a month end and the October DST change.
assert.equal(daysBetweenISO('2026-10-13', '2026-10-13'), 0)
assert.equal(daysBetweenISO('2026-09-30', '2026-10-01'), 1)
assert.equal(daysBetweenISO('2026-10-24', '2026-10-26'), 2)

// AC 1: sinceText
assert.equal(sinceText('2026-10-15', '2026-10-15'), 'today')
assert.equal(sinceText('2026-10-16', '2026-10-15'), 'today') // defensive: coversFrom never after today
assert.equal(sinceText('2026-10-14', '2026-10-15'), 'since yesterday')
assert.equal(sinceText('2026-10-13', '2026-10-15'), 'since Tuesday')
assert.equal(sinceText('2026-10-09', '2026-10-15'), 'since Friday') // 6 days back: still a weekday
assert.equal(sinceText('2026-10-08', '2026-10-15'), 'since 8 Oct') // 7 days back: a date

// AC 1: questions, same wording for both habits
assert.equal(questionText('SNACK', '2026-10-15', '2026-10-15'), 'Did you have any snacks today?')
assert.equal(questionText('ALCOHOL', '2026-10-14', '2026-10-15'), 'Did you have any alcohol since yesterday?')

// AC 2: praise
assert.equal(praiseText({ habit: 'SNACK', current: 5 }), '5 days snack-free! So proud of you 💜')
assert.equal(praiseText({ habit: 'ALCOHOL', current: 1 }), '1 day alcohol-free! So proud of you 💜')
assert.equal(praiseText({ habit: 'SNACK', current: 0 }), CHECKIN_THANKS)

// AC 3: start over — best always quoted, "so far" only after a backdated lapse
assert.equal(startOverText({ current: 0, best: 9 }), 'We can start over 💜 your best is still 9.')
assert.equal(startOverText({ current: 1, best: 9 }), 'We can start over 💜 1 day so far, your best is still 9.')
assert.equal(startOverText({ current: 2, best: 0 }), 'We can start over 💜 2 days so far, your best is still 0.')

// habitsToAsk — HABIT_ORDER, not array order; only askToday
assert.deepEqual(habitsToAsk([{ habit: 'ALCOHOL', askToday: true }, { habit: 'SNACK', askToday: true }]), ['SNACK', 'ALCOHOL'])
assert.deepEqual(habitsToAsk([{ habit: 'SNACK', askToday: false }, { habit: 'ALCOHOL', askToday: true }]), ['ALCOHOL'])
assert.deepEqual(habitsToAsk([{ habit: 'SNACK', askToday: false }, { habit: 'ALCOHOL', askToday: false }]), [])
assert.deepEqual(habitsToAsk(null), [])

// AC 4: snooze lasts for the day it was set only
assert.equal(isSnoozedToday('2026-10-15', '2026-10-15'), true)
assert.equal(isSnoozedToday('2026-10-14', '2026-10-15'), false)
assert.equal(isSnoozedToday(null, '2026-10-15'), false)

console.log('habitCheckIn: all checks passed')
