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
