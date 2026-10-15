/**
 * MPP-16: Pip's room (epic MPP-15). Every station exists at levels 1–4 from the start so
 * later tickets (shop, upgrades) only ever change a level number.
 */
export const ROOM_STATIONS = {
  BED: 'bed',
  FRIDGE: 'fridge',
  COOKER: 'cooker',
  CABINET: 'cabinet',
  WARDROBE: 'wardrobe' // MPP-40
}

export const ROOM_MIN_LEVEL = 1
export const ROOM_MAX_LEVEL = 4

export const DEFAULT_ROOM_LEVELS = {
  bed: 1,
  fridge: 1,
  cooker: 1,
  cabinet: 1,
  wardrobe: 1
}

// The room art's outline colour (the original pet outline; the herb has its own ink in herb/herbForms.js).
export const ROOM_INK = '#3b2f5c'

// MPP-39: the room's floor along the left wall (u) and the right wall (v), and the wall height —
// bigger and lower than MPP-16's 193 × 193 × 180, in the same isometric units (iso.js P()).
export const ROOM_SIZE = { u: 260, v: 300, h: 150 }

// MPP-39: the world the camera looks at — the projected room (x −62.3…459.6, y 30…383) plus a
// ~20-unit margin. The room SVG's viewBox, and what the % hit boxes are measured against.
export const ROOM_WORLD = { x: -84, y: 10, width: 564, height: 394 }
export const ROOM_WORLD_VIEWBOX = `${ROOM_WORLD.x} ${ROOM_WORLD.y} ${ROOM_WORLD.width} ${ROOM_WORLD.height}`

export const PIP_FOCUS_LIFT = 50 // MPP-39: the camera aims this far above Pip's feet (mid-body + level bar)

// MPP-39: the camera (pip-room-zoom-mockup.html). 2 screen px per room unit ≈ 2× today's phone size.
export const ROOM_PX_PER_UNIT = 2
export const ROOM_ZOOM = { MIN: 0.35, MAX: 2.2, DEFAULT: 1, STEP: 1.2, WHEEL_RATE: 0.0012, EASE: 0.25, SNAP: 0.002 }
export const ROOM_ZOOM_SAVE_DELAY_MS = 400 // wheel / key zoom is written to storage once it pauses this long
export const ROOM_CAMERA = {
  FREE_PAD: 60, // the free area runs this far past the room on every side (AC 11)
  OVERSCROLL: 120, // past it, the rubber band gives at most this much more
  STRETCH: 0.55, // how stiff the band is (lower = stiffer)
  FOLLOW: 0.22, // share of the gap closed per frame while dragging (AC 10)
  SETTLE_MS: 2000, // the float back to Pip (AC 12)
  SETTLED: 0.15, // world px: close enough to stop chasing
  TAP_SLOP_PX: 6, // a press that moves less than this is a tap (AC 9)
  KEY_STEP: 24, // world px per arrow-key press (AC 17)
  WALL_TOP_PAD: 20 // how far above the wall tops the camera may look
}
export const ROOM_ZOOM_STORAGE_KEY = 'pip-room-zoom'
export const ROOM_RECENTRE_LABEL = 'Centre on Pip'
export const ROOM_CAMERA_LABEL = "Pip's room. Drag, or use the arrow keys, to look around. Plus and minus zoom, 0 resets."

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
export const ROOM_HINT = 'Drag to look around · tap the fridge 🧊, cabinet 🏆 or wardrobe 👕' // MPP-23 / MPP-39 / MPP-40
export const SPRINKLES_ICON = '✨' // MPP-25: the room's sprinkles counter
export const FRIDGE_LOAD_ERROR = "Couldn't load the fridge."
