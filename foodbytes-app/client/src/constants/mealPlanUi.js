/** Meal Plan screen redesign: values shared by the desktop timetable and the mobile day view. */
import { RECIPES_PATH } from './appRoutes'

/** Core slots, in display order. mealId matches the `meals` table (1-4), as in DayAssignmentButtons. */
export const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Breakfast', mealId: 1 },
  { key: 'lunch', label: 'Lunch', mealId: 2 },
  { key: 'dinner', label: 'Dinner', mealId: 3 }
]
/** Rendered only when some day in the week has a snack. */
export const SNACKS_SLOT = { key: 'snacks', label: 'Snacks', mealId: 4 }

/** Same breakpoint as the old scroll-to-today check in MealPlanCalendar. */
export const MOBILE_MEDIA_QUERY = '(max-width: 768px)'

/** Remove is deferred this long so Undo can cancel it. */
export const UNDO_REMOVE_MS = 5000
/** Plain info toasts (eaten, moved). */
export const INFO_TOAST_MS = 2500

/** First-run swipe hint: set to '1' the first time the user completes a real swipe. Per device. */
export const SWIPE_HINT_STORAGE_KEY = 'fb.mealplan.swipeHintSeen'
/** A drag further left than this (px) snaps the row open and counts as a real swipe. */
export const SWIPE_COMMIT_PX = 70
/** Width of each revealed action button (Replace / Move / Remove). */
export const SWIPE_ACTION_WIDTH_PX = 76

/** `from` value marking a Recipes visit that should return to the Meal Plan after adding. */
export const PICK_FROM_MEALPLAN = 'mealplan'

/** Route for "+ Add" / "Replace": Recipes on that meal tab, in picking mode for that day when dateISO is given. */
export const recipesForMealPath = (mealKey, dateISO) =>
  dateISO ? `${RECIPES_PATH}?mealType=${mealKey}&date=${dateISO}&from=${PICK_FROM_MEALPLAN}` : `${RECIPES_PATH}?mealType=${mealKey}`
