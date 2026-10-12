/**
 * MPP-13: account-menu meal times. Keys match UserDTO.mealTimes on the backend.
 *
 * The DEFAULT times deliberately do not live here: the server always sends the
 * effective times (defaults applied) plus a `custom` flag, so there is no frontend
 * copy to drift. The order rule and its message mirror the backend's
 * MealTimesPolicy — keep MEAL_TIMES_ORDER_ERROR word-for-word identical.
 */
export const MEAL_TIME_KEYS = ['breakfastBy', 'lunchBy', 'dinnerBy']

export const MEAL_TIME_LABELS = {
  breakfastBy: 'Breakfast by',
  lunchBy: 'Lunch by',
  dinnerBy: 'Dinner by'
}

export const MEAL_TIMES_ORDER_ERROR = 'Times must run breakfast → lunch → dinner.'
