import { CHECKIN_REACTION_MS } from './pet.js'

/**
 * MPP-31: Pip's herb line. Points, thresholds and the form are computed on the server
 * (PetGrowthPolicy); the client only names forms and plays the since-last-visit sequence.
 */
export const PIP_FORMS = {
  BASIL_SEED: 1,
  SEEDLING: 2,
  SPRIG: 3,
  BUSHLING: 4,
  BASILISK: 5
}

export const PIP_FORM_NAMES = {
  1: 'Basil seed',
  2: 'Seedling',
  3: 'Sprig',
  4: 'Bushling',
  5: 'Basilisk'
}

// Drawn before the pet loads, for guests, and if a payload carries no growth.
export const PIP_DEFAULT_FORM = PIP_FORMS.BASIL_SEED

export const PIP_GROWTH_PHASES = {
  IDLE: 'idle',
  FILLING: 'filling',
  EVOLVING: 'evolving',
  DRAINING: 'draining',
  SHRINKING: 'shrinking',
  REVEALED: 'revealed'
}

// AC 7: the score of a slip day; the latest scored day being a slip means wilted.
export const PIP_SLIP_SCORE = -3

// AC 5 / AC 8: the since-last-visit sequence. Retune here.
export const PIP_GROWTH_PHASE_MS = {
  filling: 900,
  evolving: 1600,
  draining: 900,
  shrinking: 1200
}
export const PIP_GROWTH_BUBBLE_MS = CHECKIN_REACTION_MS // the closing line holds as long as a check-in reaction
export const PIP_BAR_MOVE_MS = 900 // a bar-only change (no bubble) settles in this long

// Suffixed with the user id, so two people on one browser keep their own marker (MPP-33).
export const PIP_GROWTH_SEEN_STORAGE_KEY = 'foodbytes.pip.lastSeenGrowth'

export const PIP_FULLY_GROWN_LABEL = 'Fully grown 🌸'

// AC 9: never shaming.
export const PIP_SLIP_LINE = "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!"
export const PIP_FULLY_GROWN_LINE = "I'm fully grown! 🌸 Thank you for looking after me."

// MPP-38: the small level bar over Pip's head in the room.
export const HEAD_BAR_WIDTH = 30 // room-viewBox units — same on-screen size at every form and pose
export const HEAD_BAR_HEIGHT = 5 // room-viewBox units
export const HEAD_BAR_GAP = 22 // herb units between the top of Pip's head and the bar's bottom edge; clears pip-bounce (−16px, 1.05 stretch)
export const HEAD_BAR_FLASH_MS = 450 // the full bar fills, then flashes yellow, inside the 900 ms FILLING phase
