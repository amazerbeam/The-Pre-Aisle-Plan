/**
 * MPP-23: Pip's trophy cabinet (epic MPP-15). Mirrors the MPP-22 ladder
 * (AwardLadder.MILESTONES) and MPP-24 firsts (FirstKey); wording from mockup v5.
 */
export const STREAK_TYPES = {
  PLAN: 'PLAN',
  SNACK: 'SNACK',
  ALCOHOL: 'ALCOHOL'
}

// Shelf order in the cabinet and announcement order in the bubble.
export const AWARD_STREAK_ORDER = [STREAK_TYPES.PLAN, STREAK_TYPES.SNACK, STREAK_TYPES.ALCOHOL]

export const AWARD_KINDS = {
  TROPHY: 'trophy',
  RIBBON: 'ribbon'
}

// AC 2: plan wins trophies, the two habits win ribbons. `name` finishes "1 week …" in the bubble.
export const AWARD_SHELVES = {
  PLAN: { icon: '📅', title: 'Followed the plan', kind: AWARD_KINDS.TROPHY, name: 'following the plan' },
  SNACK: { icon: '🍪', title: 'No snacks', kind: AWARD_KINDS.RIBBON, name: 'snack-free' },
  ALCOHOL: { icon: '🍷', title: 'No alcohol', kind: AWARD_KINDS.RIBBON, name: 'alcohol-free' }
}

// Mirrors AwardLadder.MILESTONES on the backend — keep in sync.
export const AWARD_MILESTONES = [1, 3, 5, 7, 14, 21, 30]
export const AWARD_MILESTONE_LABELS = {
  1: '1 day',
  3: '3 days',
  5: '5 days',
  7: '1 week',
  14: '2 weeks',
  21: '3 weeks',
  30: '1 month'
}

// Mirrors FirstKey on the backend, in its order — keep in sync.
export const FIRST_KEYS = ['MAKE_TEMPLATE', 'GENERATE_SHOPPING_LIST', 'PLAN_FULL_WEEK', 'COOK_HOMEMADE_EXTRA']
export const FIRST_LABELS = {
  MAKE_TEMPLATE: 'Make a template',
  GENERATE_SHOPPING_LIST: 'Generate a shopping list',
  PLAN_FULL_WEEK: 'Plan a full week',
  COOK_HOMEMADE_EXTRA: 'Cook a homemade extra'
}
export const FIRST_EARNED_TEXT = '✓ earned'
export const FIRST_TODO_TEXT = 'to do'

export const CABINET_NOTE = "The ladder starts again after a month, so every award can be won again. ×N is how many times you've earned it."
export const CABINET_FIRSTS_TITLE = 'Firsts — things to try'

// AC 5: how long each "🎉 New …" line stays in Pip's bubble. Retune here.
export const AWARD_BUBBLE_MS = 6000

// Suffixed with the user id, so two people on one browser keep their own baseline.
export const AWARD_SEEN_STORAGE_KEY = 'foodbytes.pip.awardCountsSeen'
