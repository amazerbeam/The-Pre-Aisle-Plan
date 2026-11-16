import { PIP_LINE } from './pipLines.js'

/**
 * MPP-32: Pip's wardrobe — slots and unlock hints (names live per creature in WARDROBE_ITEM_LABELS). Ids,
 * slots and the unlock rules themselves live on the server (WardrobeCatalogue); this file only names them. Hints follow the
 * phone mockup's UNLOCKS (mpp-32-wardrobe-phone-mockup.html).
 */
export const WARDROBE_SLOT = {
  HAT: 'HAT',
  GLASSES: 'GLASSES',
  SCARF: 'SCARF',
  JACKET: 'JACKET',
  BELT: 'BELT',
  PANTS: 'PANTS',
  SHOES: 'SHOES'
}

// AC 4: tab order.
export const WARDROBE_SLOTS = [
  { key: WARDROBE_SLOT.HAT, label: 'Hat' },
  { key: WARDROBE_SLOT.GLASSES, label: 'Glasses' },
  { key: WARDROBE_SLOT.SCARF, label: 'Scarf' },
  { key: WARDROBE_SLOT.JACKET, label: 'Jacket' },
  { key: WARDROBE_SLOT.BELT, label: 'Belt' },
  { key: WARDROBE_SLOT.PANTS, label: 'Pants' },
  { key: WARDROBE_SLOT.SHOES, label: 'Shoes' }
]

// Themed lines: a slot can read differently on one creature (the robot's hats are antennas). Sparse: absent = WARDROBE_SLOTS' label.
export const WARDROBE_SLOT_LABELS = {
  [PIP_LINE.ROBOT]: { [WARDROBE_SLOT.HAT]: 'Antenna' }
}

const { HAT, GLASSES, SCARF, JACKET, BELT, PANTS, SHOES } = WARDROBE_SLOT

// AC 1: the 20 items, in the server's catalogue order.
export const WARDROBE_ITEMS = {
  beanie: { slot: HAT, unlockHint: 'Owned from the start' },
  cap: { slot: HAT, unlockHint: '5 days alcohol-free' },
  'chef-hat': { slot: HAT, unlockHint: 'Your first homemade extra' },
  'straw-hat': { slot: HAT, unlockHint: 'Grow to Sprig' },
  'top-hat': { slot: HAT, unlockHint: 'Any 1-month streak' },
  'round-specs': { slot: GLASSES, unlockHint: 'Your first full week planned' },
  'heart-glasses': { slot: GLASSES, unlockHint: '2 weeks alcohol-free' },
  sunglasses: { slot: GLASSES, unlockHint: 'Grow to Basilisk' },
  'red-scarf': { slot: SCARF, unlockHint: '1 week alcohol-free' },
  'striped-scarf': { slot: SCARF, unlockHint: '3 weeks snack-free' },
  'chef-whites': { slot: JACKET, unlockHint: '3 days following the plan' },
  'denim-jacket': { slot: JACKET, unlockHint: '2 weeks following the plan' },
  puffer: { slot: JACKET, unlockHint: '3 weeks following the plan' },
  'leather-belt': { slot: BELT, unlockHint: '3 weeks alcohol-free' },
  'champion-belt': { slot: BELT, unlockHint: 'A 1-month streak on the plan, snacks and alcohol' },
  jeans: { slot: PANTS, unlockHint: 'Owned from the start' },
  joggers: { slot: PANTS, unlockHint: '2 weeks snack-free' },
  dungarees: { slot: PANTS, unlockHint: '1 week following the plan' },
  sneakers: { slot: SHOES, unlockHint: '1 week snack-free' },
  wellies: { slot: SHOES, unlockHint: 'Grow to Bushling' }
}

// Themed lines: each creature names the same item its own way (ids, slots and unlocks are shared).
export const WARDROBE_ITEM_LABELS = {
  [PIP_LINE.HERB]: {
    beanie: 'Beanie', cap: 'Cap', 'chef-hat': 'Chef hat', 'straw-hat': 'Straw hat', 'top-hat': 'Top hat',
    'round-specs': 'Round specs', 'heart-glasses': 'Heart glasses', sunglasses: 'Sunglasses',
    'red-scarf': 'Red scarf', 'striped-scarf': 'Striped scarf', 'chef-whites': 'Chef whites', 'denim-jacket': 'Denim jacket', puffer: 'Puffer',
    'leather-belt': 'Leather belt', 'champion-belt': 'Champion belt', jeans: 'Jeans', joggers: 'Joggers', dungarees: 'Dungarees',
    sneakers: 'Sneakers', wellies: 'Wellies'
  },
  [PIP_LINE.DRAGON]: {
    beanie: 'Horn cosy', cap: "Bard's cap", 'chef-hat': 'Singed toque', 'straw-hat': "Bird's nest", 'top-hat': 'Crown',
    'round-specs': 'Battle scar', 'heart-glasses': 'Smitten', sunglasses: 'War paint',
    'red-scarf': "Knight's cape", 'striped-scarf': 'Ivy garland', 'chef-whites': "Baker's apron", 'denim-jacket': 'Leather jerkin', puffer: 'Scale mail',
    'leather-belt': 'Potion belt', 'champion-belt': 'Hoard belt', jeans: 'Patched breeches', joggers: 'Wool hose', dungarees: "Smith's overalls",
    sneakers: 'Talon wraps', wellies: 'Iron sabatons'
  },
  [PIP_LINE.ROBOT]: {
    beanie: 'Prop-top', cap: 'Radar bar', 'chef-hat': 'Toque charm', 'straw-hat': 'Boing spring', 'top-hat': 'Neon bolt',
    'round-specs': 'Smiley.exe', 'heart-glasses': 'Heart eyes', sunglasses: 'Shades.gif',
    'red-scarf': 'Cable coil', 'striped-scarf': 'Hazard tape', 'chef-whites': 'Oven door', 'denim-jacket': 'Hull plates', puffer: 'Battery vest',
    'leather-belt': 'Tool belt', 'champion-belt': 'Marquee belt', jeans: 'Coolant casing', joggers: 'Servo sleeves', dungarees: 'Maintenance overalls',
    sneakers: 'Hover pads', wellies: 'Mag boots'
  }
}

// Suffixed with the user id, so two people on one browser keep their own list (MPP-33).
export const WARDROBE_ANNOUNCED_STORAGE_KEY = 'foodbytes.pip.wardrobeAnnounced'

export const WARDROBE_BUTTON_LABEL = 'Wardrobe'
export const WARDROBE_BUTTON_NEW_LABEL = 'Wardrobe, new outfit waiting'
export const WARDROBE_TITLE = 'Dress Pip'
export const WARDROBE_CLOSE_LABEL = 'Close and go back to the room'
export const WARDROBE_UNDRESS_LABEL = 'Undress'
export const WARDROBE_TABS_LABEL = 'Clothing slots'
export const WARDROBE_NONE_LABEL = 'None'
export const WARDROBE_NEW_TAG = 'NEW'
export const WARDROBE_LOCK_PREFIX = 'Unlock:'
export const WARDROBE_LINEUP_TITLE = 'Same outfit, every evolution'
export const WARDROBE_UNREACHED_LABEL = '???'
export const WARDROBE_SAVE_ERROR = "Couldn't save the outfit. Try again."
