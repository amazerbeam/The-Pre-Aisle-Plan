import {
  AWARD_MILESTONES,
  AWARD_MILESTONE_LABELS,
  AWARD_SHELVES,
  AWARD_STREAK_ORDER,
  FIRST_KEYS,
  FIRST_LABELS
} from '../constants/petAwards.js'

/**
 * MPP-23: the rules and wording for Pip's trophy cabinet. Pure, so petAwards.check.mjs
 * can pin them without a browser. Shapes: see services/petService.js → getAwards.
 */

/** The server's streaks in AWARD_STREAK_ORDER; unknown types are dropped, missing ones stay absent. */
export function orderStreaks(streaks) {
  const byType = new Map((streaks ?? []).map(status => [status.streakType, status]))
  return AWARD_STREAK_ORDER.filter(type => byType.has(type)).map(type => byType.get(type))
}

/** AC 3: how many times this milestone was earned. JSON keys are strings; anything odd is 0. */
export function awardCount(status, milestone) {
  const n = Number(status?.counts?.[String(milestone)])
  return Number.isInteger(n) && n > 0 ? n : 0
}

/** AC 2: "Now 4 days · best 9". */
export function streakLine({ current, best }) {
  return `Now ${dayCount(current)} · best ${best}`
}

/** AC 2: "next: 5 days in 2 days"; null when the server sent no next. */
export function nextLine(next) {
  if (!next) return null
  const label = AWARD_MILESTONE_LABELS[next.milestone] ?? dayCount(next.milestone)
  return `next: ${label} in ${dayCount(next.inDays)}`
}

/** { PLAN: { 1: n, 3: n, … }, SNACK: {…}, ALCOHOL: {…} } — the baseline awardSeenStore keeps. */
export function awardCountsOf(streaks) {
  return Object.fromEntries(orderStreaks(streaks).map(status => [
    status.streakType,
    Object.fromEntries(AWARD_MILESTONES.map(m => [m, awardCount(status, m)]))
  ]))
}

/**
 * AC 5: per streak type, the highest milestone whose count rose since `baseline`.
 * No baseline (first visit in this browser) → nothing is new. A type missing from the
 * baseline counts as all zeros.
 * @returns {Array<{ streakType: string, milestone: number, count: number }>}
 */
export function newAwards(baseline, streaks) {
  if (!baseline) return []
  const found = []
  for (const status of orderStreaks(streaks)) {
    const seen = baseline[status.streakType] ?? {}
    const risen = AWARD_MILESTONES.filter(m => awardCount(status, m) > (Number(seen[m]) || 0))
    if (risen.length === 0) continue
    const milestone = risen[risen.length - 1]
    found.push({ streakType: status.streakType, milestone, count: awardCount(status, milestone) })
  }
  return found
}

/** AC 5: "🎉 New ribbon: 1 week snack-free (×2)!" — the ×N only from the second time. */
export function announcementText({ streakType, milestone, count }) {
  const shelf = AWARD_SHELVES[streakType]
  const times = count > 1 ? ` (×${count})` : ''
  return `🎉 New ${shelf.kind}: ${AWARD_MILESTONE_LABELS[milestone]} ${shelf.name}${times}!`
}

/** AC 4: every first in FIRST_KEYS order; one the server didn't send is not earned. */
export function firstsList(firsts) {
  const byKey = new Map((firsts ?? []).map(first => [first.key, first]))
  return FIRST_KEYS.map(key => ({ key, label: FIRST_LABELS[key], earned: byKey.get(key)?.earnedAt != null }))
}

const dayCount = (n) => `${n} day${n === 1 ? '' : 's'}`
