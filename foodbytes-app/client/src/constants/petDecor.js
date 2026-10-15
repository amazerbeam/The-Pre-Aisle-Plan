/**
 * MPP-27: Pip's room decor — the three fixed spots, the 12 items and the wall / floor styles, from
 * the approved mpp-27-decor-catalogue-mockup.html. Ids, spots, prices and ownership come from the
 * server (PetRoomDTO.decor, DecorCatalogue.java); this file only names, places and colours them.
 * An id the server sends that isn't here is skipped, never drawn as a blank.
 */
export const ROOM_SPOTS = {
  LEFT_WALL: 'leftWall',
  RIGHT_WALL: 'rightWall',
  FLOOR: 'floor',
  WALL_STYLE: 'wallStyle',
  FLOOR_STYLE: 'floorStyle'
}

// The three physical spots (display order), and the two finishes.
export const DECOR_SPOTS = [ROOM_SPOTS.LEFT_WALL, ROOM_SPOTS.RIGHT_WALL, ROOM_SPOTS.FLOOR]
export const STYLE_SPOTS = [ROOM_SPOTS.WALL_STYLE, ROOM_SPOTS.FLOOR_STYLE]

export const DECOR_SPOT_LABELS = {
  leftWall: 'Left wall',
  rightWall: 'Right wall',
  floor: 'Floor',
  wallStyle: 'Walls',
  floorStyle: 'Floor'
}

// v5 isoSlot(): each spot's dashed outline as [u, v, h] corners and the "+" anchor, plus the
// volume its art can fill ([u, v, du, dv, h0, h1], like the station footprints) for the spot's
// button and the item thumbnails. Keep the volumes around every item in decorArt.jsx.
export const DECOR_SPOT_SHAPES = {
  leftWall: {
    corners: [[150, 0, 132], [186, 0, 132], [186, 0, 170], [150, 0, 170]],
    plus: [168, 0, 151],
    volume: [150, 0, 36, 8, 128, 176]
  },
  rightWall: {
    corners: [[0, 34, 142], [0, 80, 142], [0, 80, 174], [0, 34, 174]],
    plus: [0, 57, 158],
    volume: [0, 34, 4, 46, 138, 178]
  },
  floor: {
    corners: [[150, 110, 0], [186, 110, 0], [186, 150, 0], [150, 150, 0]],
    plus: [168, 130, 0],
    volume: [150, 110, 36, 40, 0, 64]
  }
}

export const DECOR_ITEMS = {
  'basil-print': { label: 'Basil print', spot: 'leftWall' },
  'recipe-board': { label: 'Recipe chalkboard', spot: 'leftWall' },
  'herb-shelf': { label: 'Herb shelf', spot: 'leftWall' },
  'fairy-lights': { label: 'Fairy lights', spot: 'leftWall' },
  'wall-clock': { label: 'Wall clock', spot: 'rightWall' },
  bunting: { label: 'Bunting', spot: 'rightWall' },
  'pan-rail': { label: 'Copper pan rail', spot: 'rightWall' },
  mirror: { label: 'Round mirror', spot: 'rightWall' },
  'watering-can': { label: 'Watering can', spot: 'floor' },
  'cookbook-stack': { label: 'Cookbook stack', spot: 'floor' },
  'bean-bag': { label: 'Bean bag', spot: 'floor' },
  'lemon-tree': { label: 'Potted lemon tree', spot: 'floor' }
}

// MPP-39: White is the free default wall (Lavender stays free and owned). Lilac stays the default floor.
export const DEFAULT_WALL_STYLE = 'wall-white'
export const DEFAULT_FLOOR_STYLE = 'floor-lilac'

// left / right = the wall fills (right = the window wall); skirting = the board along both walls (MPP-39); base = the floor fill; sprigs / boards / grid / checker = the pattern over it.
export const ROOM_STYLES = {
  'wall-white': { label: 'White', spot: 'wallStyle', left: '#eceef2', right: '#ffffff', skirting: '#dfe3e9' },
  'wall-lavender': { label: 'Lavender', spot: 'wallStyle', left: '#ece5fb', right: '#e3daf8', skirting: '#cbbdea' },
  'wall-mint': { label: 'Mint', spot: 'wallStyle', left: '#dff3e8', right: '#d2ecdd', skirting: '#bcdcc8' },
  'wall-peach': { label: 'Peach', spot: 'wallStyle', left: '#fde6d8', right: '#f8d9c6', skirting: '#ecc4ab' },
  'wall-sky': { label: 'Sky', spot: 'wallStyle', left: '#dcecfb', right: '#cfe2f6', skirting: '#b9d3ee' },
  'wall-sprig': { label: 'Sprig wallpaper', spot: 'wallStyle', left: '#eef6e4', right: '#e4efd8', sprigs: true, skirting: '#cfe0bd' },
  'floor-lilac': { label: 'Lilac', spot: 'floorStyle', base: '#d6c9f0' },
  'floor-oak': { label: 'Oak boards', spot: 'floorStyle', base: '#d9b48a', boards: '#b98a5a' },
  'floor-terracotta': { label: 'Terracotta tiles', spot: 'floorStyle', base: '#d98b6a', grid: '#b8684a' },
  'floor-checker': { label: 'Checkerboard', spot: 'floorStyle', base: '#f3efe6', checker: '#c8bfe0' }
}

export const EDIT_ROOM_LABEL = 'Edit room'
export const EDIT_ROOM_HINT = 'Editing: tap a dashed spot'
export const EDIT_ROOM_DONE = 'Done'
export const DECOR_PICKER_CLOSE = 'Close'
export const DECOR_EMPTY_LABEL = 'Empty'
export const DECOR_BUY_MORE = '🛍 Buy more for this spot'
export const DECOR_ALL_OWNED = 'You own everything for this spot ✨'
export const DECOR_OWNED_LABEL = '✓ Owned'
export const DECOR_BUSY_LABEL = 'Buying…'
export const DECOR_SHOP_INTRO = "Buy decor and colours for Pip's room. They're yours forever. Move them around with ✏️ Edit room."
export const DECOR_BOUGHT_LINE = 'Ooh, I love it! 🌿✨' // Pip's bubble after a purchase (the award slot)
export const DECOR_SAVE_ERROR = "Couldn't change the room. Check your connection and try again."
export const DECOR_BUY_ERROR = "Couldn't buy that. Check your connection and try again. No sprinkles were spent."

// The Shop sheet's tabs. The 🛍 pill opens Upgrades; "Buy more for this spot" opens Decor.
export const SHOP_TAB_KEYS = { UPGRADES: 'upgrades', DECOR: 'decor', STYLES: 'styles' }
export const SHOP_TABS = [
  { key: SHOP_TAB_KEYS.UPGRADES, label: 'Upgrades' },
  { key: SHOP_TAB_KEYS.DECOR, label: 'Decor' },
  { key: SHOP_TAB_KEYS.STYLES, label: 'Walls & floors' }
]
