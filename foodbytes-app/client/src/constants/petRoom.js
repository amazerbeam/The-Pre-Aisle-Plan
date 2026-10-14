/**
 * MPP-16: Pip's room (epic MPP-15). Every station exists at levels 1–4 from the start so
 * later tickets (shop, upgrades) only ever change a level number.
 */
export const ROOM_STATIONS = {
  BED: 'bed',
  FRIDGE: 'fridge',
  COOKER: 'cooker',
  CABINET: 'cabinet'
}

export const ROOM_MIN_LEVEL = 1
export const ROOM_MAX_LEVEL = 4

export const DEFAULT_ROOM_LEVELS = {
  bed: 1,
  fridge: 1,
  cooker: 1,
  cabinet: 1
}

// The room art's outline colour (the original pet outline; the herb has its own ink in herb/herbForms.js).
export const ROOM_INK = '#3b2f5c'

// Mockup v5 projection space; the SVG scales to the card width.
export const ROOM_VIEWBOX_SIZE = { width: 360, height: 330 }
export const ROOM_VIEWBOX = `0 0 ${ROOM_VIEWBOX_SIZE.width} ${ROOM_VIEWBOX_SIZE.height}`

// MPP-19: Pip's fridge — always 15 slots on 3 shelves (mockup v5 FRIDGE_FOOD), filled by
// the share of this week's planned breakfast/lunch/dinner the viewer hasn't eaten.
export const FRIDGE_SLOT_COUNT = 15
export const FRIDGE_SHELF_COUNT = 3
export const FRIDGE_FOOD = ['🥚', '🥛', '🧀', '🍗', '🐟', '🥩', '🥦', '🥕', '🍅', '🫑', '🥬', '🧅', '🍋', '🫐', '🍠']

// AC 4: gauge green above PLENTY, amber above LOW, red at LOW or below. Retune here.
export const FRIDGE_LOW_PCT = 20
export const FRIDGE_PLENTY_PCT = 50

export const FRIDGE_BANDS = {
  NONE: 'none',
  EMPTY: 'empty',
  LOW: 'low',
  PLENTY: 'plenty',
  FULL: 'full'
}

export const FRIDGE_GAUGE_COLOURS = {
  high: '#5cb85c',
  mid: '#f0ad4e',
  low: '#e5534b'
}

// AC 5: one note per band.
export const FRIDGE_NOTES = {
  none: 'Plan your week to stock the fridge',
  empty: 'Empty! Time for a shop 🛒',
  low: 'Running low, shopping day soon?',
  plenty: 'Plenty left for the week',
  full: 'Fully stocked for the week ✨'
}

export const FRIDGE_LOW_BUBBLE = 'The fridge is getting empty 👀'
export const FRIDGE_EMPTY_METER = 'No meals planned this week'
export const FRIDGE_FOOTNOTE = "Always 15 slots. How full it is = planned meals you haven't eaten yet ÷ meals planned this week. It restocks when you plan your week."
export const ROOM_HINT = 'Tap the fridge 🧊 or cabinet 🏆' // MPP-23: mockup v5 .hint
export const SPRINKLES_ICON = '✨' // MPP-25: the room's sprinkles counter
export const FRIDGE_LOAD_ERROR = "Couldn't load the fridge."
