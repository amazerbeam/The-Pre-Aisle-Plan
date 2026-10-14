/**
 * MPP-14: the plan's pet. The default NAME deliberately does not live here:
 * the server always sends the effective name (PetPolicy.DEFAULT_NAME), so there is
 * no frontend copy to drift. Guests have no pet and see PET_GUEST_TAB_LABEL.
 */
export const PET_MOODS = {
  CONTENT: 'content',
  HAPPY: 'happy',
  BORED: 'bored',
  MISCHIEVOUS: 'mischievous'
}

export const PET_MOOD_LABELS = {
  content: 'Content',
  happy: 'Happy',
  bored: 'Bored',
  mischievous: 'Mischievous'
}

// AC 6: only these meal types count; snacks and extras never move the mood.
export const PET_COUNTED_MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

// Meal type → key in PetDTO.mealTimes (MPP-13 shape).
export const PET_MEAL_TIME_KEY = {
  breakfast: 'breakfastBy',
  lunch: 'lunchBy',
  dinner: 'dinnerBy'
}

export const PET_SLOT_STATUS = {
  LOGGED: 'logged',
  DUE: 'due',
  UPCOMING: 'upcoming',
  UNPLANNED: 'unplanned'
}

// Mirrors PetPolicy.MAX_NAME_LENGTH on the backend — keep in sync.
export const PET_NAME_MAX_LENGTH = 12

export const PET_GUEST_TAB_LABEL = 'Pet'
export const PET_GUEST_MESSAGE = 'Sign in to meet your pet!'

export const PET_CLOCK_TICK_MS = 60_000

// MPP-17: where Pip is in his room, by the viewer's own meal times (AC 2). Retune here.
export const PIP_POSITIONS = {
  RUG: 'rug',
  COOKER: 'cooker',
  BED: 'bed'
}

export const PIP_COOKER_WINDOW_MIN = 30 // at the cooker from 30 min before to 30 min after each meal time
export const PIP_BED_AFTER_DINNER_MIN = 180 // asleep from dinner time + 3 h…
export const PIP_WAKE_BEFORE_BREAKFAST_MIN = 60 // …until breakfast time − 1 h

// A face, not a mood: never add it to PET_MOODS / PET_MOOD_LABELS (mood logic is unchanged).
export const PET_SLEEP_FACE = 'sleep'

// Room aria-label wording; the rug falls back to the mood label.
export const PIP_POSITION_LABELS = {
  cooker: 'at the cooker',
  bed: 'asleep in bed'
}

// MPP-18: Pip cooks and serves a newly eaten meal on /pet.
export const COOK_PHASES = {
  WALKING: 'walking',
  COOKING: 'cooking',
  SERVED: 'served',
  RETURNING: 'returning'
}

// MPP-29 AC 2: no one-shot room sequence (cook scene, stage change) runs longer than this.
export const PIP_ANIMATION_MAX_MS = 3000

// Walk 0.7 s, cook 1.0 s, plate 0.8 s, walk back 0.5 s = 3.0 s (MPP-29 AC 2; mockup v5 was 6.4 s).
// PipWalker's CSS walks read `walking` (out) and `returning` (back) via pipWalkMs, so retune here only.
export const COOK_PHASE_MS = {
  walking: 700,
  cooking: 1000,
  served: 800,
  returning: 500
}

// AC 5: no movement — just the served plate, held a little longer.
export const COOK_REDUCED_MOTION_SERVED_MS = 2500

// Suffixed with the user id, so two people on one browser keep their own marker (AC 6).
export const PIP_SEEN_EATEN_STORAGE_KEY = 'foodbytes.pip.lastSeenEatenAt'

// MPP-34: a confirmed eaten tick hands off to Pip's room after a short "✓ Eaten" beat (AC 2).
export const PET_ROUTE = '/pet'
export const PIP_HANDOFF_DELAY_MS = 600

// MPP-21: the daily snack / alcohol check-in in Pip's bubble (MPP-20 habits).
export const HABITS = {
  SNACK: 'SNACK',
  ALCOHOL: 'ALCOHOL'
}
export const HABIT_ORDER = [HABITS.SNACK, HABITS.ALCOHOL] // snacks first, then alcohol (AC 1)
export const HABIT_QUESTION_NOUN = { SNACK: 'snacks', ALCOHOL: 'alcohol' }
export const HABIT_FREE_LABEL = { SNACK: 'snack-free', ALCOHOL: 'alcohol-free' }
export const CHECKIN_STEPS = {
  ASK: 'ask',
  WHEN: 'when',
  FIRST: 'first' // MPP-35: the one-time "When did you last…?" while a habit has never been answered
}
export const CHECKIN_REACTION_MS = 8000 // how long the last reaction stays before the usual bubble returns
export const CHECKIN_WEEKDAY_SPAN_DAYS = 6 // "since Wednesday" up to 6 days back; a date after that
export const CHECKIN_SNOOZE_STORAGE_KEY = 'foodbytes.pip.checkInSnoozedOn'
export const CHECKIN_WHEN_PROMPT = "That's ok! When did you have it?"
export const CHECKIN_SNOOZE_REPLY = "No worries, I'll ask tomorrow 💜"
export const CHECKIN_SAVE_FAILED = "Hmm, I couldn't save that. I'll ask again next time 💜"
export const CHECKIN_THANKS = 'Thanks for telling me 💜'

// MPP-35: the one-time question per habit. The API enforces the same 30 (HabitStreakPolicy.FIRST_ANSWER_DAYS).
export const FIRST_ANSWER_DAYS_BACK = 30
export const HABIT_FIRST_QUESTION = {
  SNACK: 'When did you last have a snack?',
  ALCOHOL: 'When did you last have a drink?'
}
export const CHECKIN_FIRST_HINT = 'Longer ago? Pick the earliest day.'
