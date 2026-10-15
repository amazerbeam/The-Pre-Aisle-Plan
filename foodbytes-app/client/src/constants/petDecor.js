/**
 * MPP-27 / MPP-40: Pip's room decor — the 12 named spots (world coords), the 55 items and the wall / floor
 * styles, from the approved pip-room-decor-spots-mockup.html. Ids, spots, prices and ownership come from the
 * server (PetRoomDTO.decor, DecorCatalogue.java); this file only names, places and colours them.
 * An id the server sends that isn't here is skipped, never drawn as a blank.
 */
export const ROOM_SPOTS = {
  OVER_WARDROBE: 'overWardrobe',
  BEDSIDE_WALL: 'bedsideWall',
  FRONT_RIGHT_WALL: 'frontRightWall',
  WINDOW_DRESSING: 'windowDressing',
  WINDOWSILL: 'windowsill',
  RUG: 'rug',
  BACK_CORNER: 'backCorner',
  BEDSIDE_NOOK: 'bedsideNook',
  FOOT_OF_BED: 'footOfBed',
  BY_FRIDGE: 'byFridge',
  CORNER_BY_DOOR: 'cornerByDoor',
  FRONT_OF_ROOM: 'frontOfRoom',
  WALL_STYLE: 'wallStyle',
  FLOOR_STYLE: 'floorStyle'
}

// The 12 physical spots (display order), and the two finishes.
export const DECOR_SPOTS = [
  ROOM_SPOTS.OVER_WARDROBE, ROOM_SPOTS.BEDSIDE_WALL, ROOM_SPOTS.FRONT_RIGHT_WALL, ROOM_SPOTS.WINDOW_DRESSING,
  ROOM_SPOTS.WINDOWSILL, ROOM_SPOTS.RUG, ROOM_SPOTS.BACK_CORNER, ROOM_SPOTS.BEDSIDE_NOOK, ROOM_SPOTS.FOOT_OF_BED,
  ROOM_SPOTS.BY_FRIDGE, ROOM_SPOTS.CORNER_BY_DOOR, ROOM_SPOTS.FRONT_OF_ROOM
]
export const STYLE_SPOTS = [ROOM_SPOTS.WALL_STYLE, ROOM_SPOTS.FLOOR_STYLE]

// The room draws the spots in four layers, back to front (PetRoom puts each among the stations).
export const DECOR_LAYERS = {
  rug: [ROOM_SPOTS.RUG],
  wall: [ROOM_SPOTS.OVER_WARDROBE, ROOM_SPOTS.BEDSIDE_WALL, ROOM_SPOTS.FRONT_RIGHT_WALL, ROOM_SPOTS.WINDOW_DRESSING, ROOM_SPOTS.WINDOWSILL],
  backFloor: [ROOM_SPOTS.BACK_CORNER, ROOM_SPOTS.BEDSIDE_NOOK],
  frontFloor: [ROOM_SPOTS.CORNER_BY_DOOR, ROOM_SPOTS.FOOT_OF_BED, ROOM_SPOTS.BY_FRIDGE, ROOM_SPOTS.FRONT_OF_ROOM]
}

// Spot buttons, largest first: later buttons sit on top, so the windowsill wins over the window dressing and small floor spots over the rug.
export const SPOT_BUTTON_ORDER = [
  ROOM_SPOTS.WINDOW_DRESSING, ROOM_SPOTS.RUG, ROOM_SPOTS.OVER_WARDROBE, ROOM_SPOTS.BEDSIDE_WALL, ROOM_SPOTS.FRONT_RIGHT_WALL,
  ROOM_SPOTS.WINDOWSILL, ROOM_SPOTS.BACK_CORNER, ROOM_SPOTS.BEDSIDE_NOOK, ROOM_SPOTS.FOOT_OF_BED,
  ROOM_SPOTS.BY_FRIDGE, ROOM_SPOTS.CORNER_BY_DOOR, ROOM_SPOTS.FRONT_OF_ROOM
]

export const DECOR_SPOT_LABELS = {
  overWardrobe: 'Over the wardrobe',
  bedsideWall: 'Bedside wall',
  frontRightWall: 'Front right wall',
  windowDressing: 'Window dressing',
  windowsill: 'Windowsill',
  rug: 'Rug',
  backCorner: 'Back corner',
  bedsideNook: 'Bedside nook',
  footOfBed: 'Foot of the bed',
  byFridge: 'By the fridge',
  cornerByDoor: 'Corner by the door',
  frontOfRoom: 'Front of the room',
  wallStyle: 'Walls',
  floorStyle: 'Floor'
}

// A floor spot over u u0–u1 × v v0–v1: outline corners [u0,v0] [u1,v0] [u1,v1] [u0,v1] at h 0, "+" and name tag at the
// centre unless given, volume up to h1.
const floorSpot = (u0, u1, v0, v1, h1, tag) => ({
  corners: [[u0, v0, 0], [u1, v0, 0], [u1, v1, 0], [u0, v1, 0]],
  plus: [(u0 + u1) / 2, (v0 + v1) / 2, 0],
  tag: tag ?? [(u0 + u1) / 2, (v0 + v1) / 2, 0],
  volume: [u0, v0, u1 - u0, v1 - v0, 0, h1]
})

// World coords (iso.js P()). Each spot's dashed outline as [u, v, h] `corners`, the "+" anchor `plus`, the edit-mode
// name label anchor `tag`, and the volume its art can fill ([u, v, du, dv, h0, h1], like the station footprints)
// for the spot's button, the item thumbnails and room.check.mjs's no-overlap-with-stations check.
export const DECOR_SPOT_SHAPES = {
  overWardrobe: {
    corners: [[20, 0, 102], [56, 0, 102], [56, 0, 140], [20, 0, 140]],
    plus: [38, 0, 121], tag: [38, 0, 140], volume: [20, 0, 36, 8, 98, 146]
  },
  bedsideWall: {
    corners: [[0, 134, 60], [0, 154, 60], [0, 154, 124], [0, 134, 124]],
    plus: [0, 144, 92], tag: [0, 144, 52], volume: [0, 134, 6, 20, 60, 132]
  },
  frontRightWall: {
    corners: [[0, 250, 102], [0, 296, 102], [0, 296, 134], [0, 250, 134]],
    plus: [0, 273, 118], tag: [0, 273, 134], volume: [0, 250, 4, 46, 98, 138]
  },
  windowDressing: {
    corners: [[0, 156, 60], [0, 244, 60], [0, 244, 146], [0, 156, 146]],
    plus: [0, 160, 140], tag: [0, 198, 146], volume: [0, 156, 16, 88, 60, 150]
  },
  windowsill: {
    corners: [[0, 158, 74], [14, 158, 74], [14, 238, 74], [0, 238, 74]],
    plus: [7, 198, 74], tag: [7, 198, 66], volume: [0, 158, 14, 80, 74, 100]
  },
  rug: { ...floorSpot(82, 198, 106, 194, 2, [198, 150, 0]), plus: [140, 150, 0] },
  backCorner: floorSpot(2, 30, 32, 52, 80, [16, 42, -4]),
  bedsideNook: floorSpot(2, 32, 140, 182, 70),
  footOfBed: floorSpot(96, 126, 196, 240, 30),
  byFridge: floorSpot(220, 256, 130, 170, 64),
  cornerByDoor: floorSpot(4, 40, 258, 294, 100),
  frontOfRoom: floorSpot(172, 208, 232, 268, 40)
}

export const DECOR_ITEMS = {
  // Over the wardrobe
  'basil-print': { label: 'Basil print', spot: 'overWardrobe' },
  'recipe-board': { label: 'Recipe chalkboard', spot: 'overWardrobe' },
  'herb-shelf': { label: 'Herb shelf', spot: 'overWardrobe' },
  'fairy-lights': { label: 'Fairy lights', spot: 'overWardrobe' },
  'pip-portrait': { label: 'Pip portrait', spot: 'overWardrobe' },
  // Bedside wall
  'growth-chart': { label: 'Growth chart', spot: 'bedsideWall' },
  'meal-calendar': { label: 'Meal-plan calendar', spot: 'bedsideWall' },
  'wall-sconce': { label: 'Wall lamp', spot: 'bedsideWall' },
  'photo-strip': { label: 'Photo frames', spot: 'bedsideWall' },
  // Front right wall
  'wall-clock': { label: 'Wall clock', spot: 'frontRightWall' },
  bunting: { label: 'Bunting', spot: 'frontRightWall' },
  'pan-rail': { label: 'Copper pan rail', spot: 'frontRightWall' },
  mirror: { label: 'Round mirror', spot: 'frontRightWall' },
  'coat-hooks': { label: 'Coat hooks', spot: 'frontRightWall' },
  // Window dressing
  'curtains-gingham': { label: 'Gingham curtains', spot: 'windowDressing' },
  'curtains-linen': { label: 'Linen curtains', spot: 'windowDressing' },
  'roller-blind': { label: 'Roller blind', spot: 'windowDressing' },
  'window-lights': { label: 'Window fairy lights', spot: 'windowDressing' },
  'plant-hanger': { label: 'Hanging plant', spot: 'windowDressing' },
  // Windowsill
  'sill-basil': { label: 'Basil pots', spot: 'windowsill' },
  'sill-succulents': { label: 'Succulents', spot: 'windowsill' },
  'sill-cactus': { label: 'Cactus pair', spot: 'windowsill' },
  'sill-radio': { label: 'Retro radio', spot: 'windowsill' },
  'sill-cat': { label: 'Lucky cat', spot: 'windowsill' },
  // Rug
  'rug-pink': { label: 'Pink rug', spot: 'rug' },
  'rug-braided': { label: 'Braided rug', spot: 'rug' },
  'rug-leaf': { label: 'Basil-leaf rug', spot: 'rug' },
  'rug-stripe': { label: 'Rainbow stripes', spot: 'rug' },
  'rug-picnic': { label: 'Picnic blanket', spot: 'rug' },
  'rug-sheepskin': { label: 'Sheepskin', spot: 'rug' },
  // Back corner
  'snake-plant': { label: 'Snake plant', spot: 'backCorner' },
  cactus: { label: 'Tall cactus', spot: 'backCorner' },
  'umbrella-stand': { label: 'Umbrella stand', spot: 'backCorner' },
  broom: { label: 'Broom + dustpan', spot: 'backCorner' },
  // Bedside nook
  'side-table-lamp': { label: 'Side table + lamp', spot: 'bedsideNook' },
  'record-player': { label: 'Record player', spot: 'bedsideNook' },
  'plant-stand': { label: 'Plant stand', spot: 'bedsideNook' },
  'stool-books': { label: 'Stool + books', spot: 'bedsideNook' },
  // Foot of the bed
  'toy-chest': { label: 'Toy chest', spot: 'footOfBed' },
  bench: { label: 'Bed bench', spot: 'footOfBed' },
  'laundry-basket': { label: 'Laundry basket', spot: 'footOfBed' },
  slippers: { label: 'Mat + slippers', spot: 'footOfBed' },
  // By the fridge
  'watering-can': { label: 'Watering can', spot: 'byFridge' },
  'cookbook-stack': { label: 'Cookbook stack', spot: 'byFridge' },
  'bean-bag': { label: 'Bean bag', spot: 'byFridge' },
  'lemon-tree': { label: 'Potted lemon tree', spot: 'byFridge' },
  'veg-basket': { label: 'Veg basket', spot: 'byFridge' },
  // Corner by the door
  monstera: { label: 'Monstera', spot: 'cornerByDoor' },
  'coat-stand': { label: 'Coat stand', spot: 'cornerByDoor' },
  'arc-lamp': { label: 'Arc floor lamp', spot: 'cornerByDoor' },
  guitar: { label: 'Guitar', spot: 'cornerByDoor' },
  // Front of the room
  pouffe: { label: 'Pouffe', spot: 'frontOfRoom' },
  'tea-table': { label: 'Tea table', spot: 'frontOfRoom' },
  'pip-ball': { label: "Pip's ball", spot: 'frontOfRoom' },
  'picnic-basket': { label: 'Picnic basket', spot: 'frontOfRoom' }
}

// MPP-39: White is the free default wall (Lavender stays free and owned). Lilac stays the default floor.
export const DEFAULT_WALL_STYLE = 'wall-white'
export const DEFAULT_FLOOR_STYLE = 'floor-lilac'
// MPP-40: the rug is a spot that always holds something; clearing it puts the pink rug back.
export const DEFAULT_RUG = 'rug-pink'
export const DEFAULT_PLACEMENTS = { wallStyle: DEFAULT_WALL_STYLE, floorStyle: DEFAULT_FLOOR_STYLE, rug: DEFAULT_RUG }

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
