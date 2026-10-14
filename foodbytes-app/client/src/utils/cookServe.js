import { MEAL_TYPE_LABELS } from '../constants/mealTypes.js'
import { COOK_PHASES, COOK_PHASE_MS, COOK_REDUCED_MOTION_SERVED_MS, PET_COUNTED_MEAL_TYPES } from '../constants/pet.js'

const FULL_SCENE = [COOK_PHASES.WALKING, COOK_PHASES.COOKING, COOK_PHASES.SERVED, COOK_PHASES.RETURNING]

/**
 * MPP-18 AC 1/2/4: play when the viewer's latest eaten meal (epoch ms) is newer than the
 * one this browser last played. Only the latest is compared, so several new meals give
 * one scene. A missing or corrupt marker counts as never seen.
 */
export function shouldServe(lastLoggedAt, lastSeenAt) {
  if (!Number.isFinite(lastLoggedAt)) return false
  return !Number.isFinite(lastSeenAt) || lastLoggedAt > lastSeenAt
}

/** AC 1/5: the phases in play order; reduced motion skips the walking and cooking. */
export function cookServeSchedule(reducedMotion) {
  if (reducedMotion) return [{ phase: COOK_PHASES.SERVED, ms: COOK_REDUCED_MOTION_SERVED_MS }]
  return FULL_SCENE.map(phase => ({ phase, ms: COOK_PHASE_MS[phase] }))
}

/**
 * MPP-29: PipWalker's CSS walk lasts exactly the phase that starts it — out in `walking`,
 * back in `returning`. Other phases don't move Pip; they fall back to the walk out, which
 * is the next walk from idle.
 */
export function pipWalkMs(phase) {
  return phase === COOK_PHASES.RETURNING ? COOK_PHASE_MS.returning : COOK_PHASE_MS.walking
}

/** Speech-bubble copy for a phase (mockup v5 logMeal()); null for an unknown phase or meal. */
export function cookServeBubble({ phase, mealType }) {
  const label = MEAL_TYPE_LABELS[mealType]
  if (!label) return null
  switch (phase) {
    case COOK_PHASES.WALKING:
      return `Yay, ${label.toLowerCase()} time! Let me cook 🍳`
    case COOK_PHASES.COOKING:
      return `Cooking your ${label.toLowerCase()}…`
    case COOK_PHASES.SERVED:
      return `${label} is served! 🍽️`
    case COOK_PHASES.RETURNING:
      return 'Yum! 💜'
    default:
      return null
  }
}

/**
 * MPP-34: after a confirmed eaten tick, hand off to Pip only when MPP-18 will play for it —
 * a signed-in viewer with a loaded Pip, a counted meal type, planned for today or yesterday
 * (the window derivePetMood reads lastLoggedAt from).
 */
export function shouldTakeToPip({ isAuthenticated, petReady, mealType, planDate, todayISO, yesterdayISO }) {
  return isAuthenticated === true
    && petReady === true
    && PET_COUNTED_MEAL_TYPES.includes(mealType)
    && (planDate === todayISO || planDate === yesterdayISO)
}
