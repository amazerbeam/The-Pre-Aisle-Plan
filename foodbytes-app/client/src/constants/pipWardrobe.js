/**
 * MPP-32: Pip's wardrobe — slots, item labels and unlock hints. Ids, slots and the unlock rules
 * themselves live on the server (WardrobeCatalogue); this file only names them. Hints follow the
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

const { HAT, GLASSES, SCARF, JACKET, BELT, PANTS, SHOES } = WARDROBE_SLOT

// AC 1: the 20 items, in the server's catalogue order.
export const WARDROBE_ITEMS = {
  beanie: { slot: HAT, label: 'Beanie', unlockHint: 'Owned from the start' },
  cap: { slot: HAT, label: 'Cap', unlockHint: '5 days alcohol-free' },
  'chef-hat': { slot: HAT, label: 'Chef hat', unlockHint: 'Your first homemade extra' },
  'straw-hat': { slot: HAT, label: 'Straw hat', unlockHint: 'Grow to Sprig' },
  'top-hat': { slot: HAT, label: 'Top hat', unlockHint: 'Any 1-month streak' },
  'round-specs': { slot: GLASSES, label: 'Round specs', unlockHint: 'Your first full week planned' },
  'heart-glasses': { slot: GLASSES, label: 'Heart glasses', unlockHint: '2 weeks alcohol-free' },
  sunglasses: { slot: GLASSES, label: 'Sunglasses', unlockHint: 'Grow to Basilisk' },
  'red-scarf': { slot: SCARF, label: 'Red scarf', unlockHint: '1 week alcohol-free' },
  'striped-scarf': { slot: SCARF, label: 'Striped scarf', unlockHint: '3 weeks snack-free' },
  'chef-whites': { slot: JACKET, label: 'Chef whites', unlockHint: '3 days following the plan' },
  'denim-jacket': { slot: JACKET, label: 'Denim jacket', unlockHint: '2 weeks following the plan' },
  puffer: { slot: JACKET, label: 'Puffer', unlockHint: '3 weeks following the plan' },
  'leather-belt': { slot: BELT, label: 'Leather belt', unlockHint: '3 weeks alcohol-free' },
  'champion-belt': { slot: BELT, label: 'Champion belt', unlockHint: 'A 1-month streak on the plan, snacks and alcohol' },
  jeans: { slot: PANTS, label: 'Jeans', unlockHint: 'Owned from the start' },
  joggers: { slot: PANTS, label: 'Joggers', unlockHint: '2 weeks snack-free' },
  dungarees: { slot: PANTS, label: 'Dungarees', unlockHint: '1 week following the plan' },
  sneakers: { slot: SHOES, label: 'Sneakers', unlockHint: '1 week snack-free' },
  wellies: { slot: SHOES, label: 'Wellies', unlockHint: 'Grow to Bushling' }
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
