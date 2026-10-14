import {
  CHECKIN_STEPS,
  CHECKIN_THANKS,
  CHECKIN_WEEKDAY_SPAN_DAYS,
  FIRST_ANSWER_DAYS_BACK,
  HABIT_FIRST_QUESTION,
  HABIT_FREE_LABEL,
  HABIT_ORDER,
  HABIT_QUESTION_NOUN
} from '../constants/pet.js'
import { formatLongWeekday, parseISODate } from './dateUtils.js'

const MS_PER_DAY = 86_400_000

/**
 * MPP-21: the rules and wording for Pip's daily check-in. Pure, so
 * habitCheckIn.check.mjs can pin them without a browser.
 */

/** Whole days from one 'YYYY-MM-DD' to another (UTC arithmetic, so DST can't shift it). */
export function daysBetweenISO(fromISO, toISO) {
  const toUtc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(toISO) - toUtc(fromISO)) / MS_PER_DAY)
}

/** AC 1: how far back one answer reaches — "today", "since yesterday", "since Wednesday", "since 3 Oct". */
export function sinceText(coversFromISO, todayISO) {
  const back = daysBetweenISO(coversFromISO, todayISO)
  if (back <= 0) return 'today'
  if (back === 1) return 'since yesterday'
  if (back <= CHECKIN_WEEKDAY_SPAN_DAYS) return `since ${formatLongWeekday(coversFromISO)}`
  const date = parseISODate(coversFromISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `since ${date}`
}

/** AC 1: "Did you have any snacks today?" / "Did you have any alcohol since yesterday?" */
export function questionText(habit, coversFromISO, todayISO) {
  return `Did you have any ${HABIT_QUESTION_NOUN[habit]} ${sinceText(coversFromISO, todayISO)}?`
}

/** AC 2: praise after "No", from the status the server returned. */
export function praiseText({ habit, current }) {
  if (!current) return CHECKIN_THANKS
  return `${dayCount(current)} ${HABIT_FREE_LABEL[habit]}! So proud of you 💜`
}

/** AC 3: the gentle reply after a lapse is saved. Never shaming: best is always quoted. */
export function startOverText({ current, best }) {
  const soFar = current ? `${dayCount(current)} so far, ` : ''
  return `We can start over 💜 ${soFar}your best is still ${best}.`
}

/** The habits to ask, in HABIT_ORDER, that the server says are unanswered today. */
export function habitsToAsk(statuses) {
  const asked = new Set((statuses ?? []).filter(s => s.askToday).map(s => s.habit))
  return HABIT_ORDER.filter(habit => asked.has(habit))
}

/** AC 4: "Not now" lasts until the next day only. */
export function isSnoozedToday(snoozedOnISO, todayISO) {
  return snoozedOnISO != null && snoozedOnISO === todayISO
}

/** MPP-35: a habit the person has never answered gets the one-time "When did you last…?" question. */
export function isFirstAnswer(status) {
  return status?.lastAnsweredDate == null
}

/** MPP-35: the earliest date the one-time question accepts — todayISO minus 30 days (UTC arithmetic). */
export function firstAnswerEarliestISO(todayISO) {
  const [y, m, d] = todayISO.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d - FIRST_ANSWER_DAYS_BACK)).toISOString().slice(0, 10)
}

/** MPP-35: "When did you last have a snack?" / "When did you last have a drink?" */
export function firstQuestionText(habit) {
  return HABIT_FIRST_QUESTION[habit]
}

/** The opening step for a habit: the one-time question if never answered, else the daily one. */
export function stepFor(habit, status) {
  return { kind: isFirstAnswer(status) ? CHECKIN_STEPS.FIRST : CHECKIN_STEPS.ASK, habit }
}

const dayCount =(n) => `${n} day${n === 1 ? '' : 's'}`
