/**
 * MPP-14: the plan's pet (Mochi). The default NAME deliberately does not live here:
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

// Mockup v5 logMeal(): walk 1.3 s, cook 2.2 s, plate 1.6 s, walk back. Retune here.
export const COOK_PHASE_MS = {
  walking: 1300,
  cooking: 2200,
  served: 1600,
  returning: 1300
}

// AC 5: no movement — just the served plate, held a little longer.
export const COOK_REDUCED_MOTION_SERVED_MS = 2500

// Suffixed with the user id, so two people on one browser keep their own marker (AC 6).
export const PIP_SEEN_EATEN_STORAGE_KEY = 'foodbytes.pip.lastSeenEatenAt'
