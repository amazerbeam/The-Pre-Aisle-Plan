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

// Mockup v5 projection space; the SVG scales to the card width.
export const ROOM_VIEWBOX = '0 0 360 330'
