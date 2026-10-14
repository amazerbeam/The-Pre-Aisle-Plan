/**
 * MPP-26: the Shop sheet — copy, the stations in display order, level names and Pip's lines.
 * Prices live on the server (PetRoomDTO.upgradeCosts); this file only names things.
 * Level names follow furniture.jsx's art comments (pip-room-mockup-v5.html levels 1–4).
 */
export const SHOP_TITLE = 'Shop'
export const SHOP_BUTTON_LABEL = 'Shop'
export const SHOP_CLOSE_LABEL = 'Close the shop'
export const SHOP_INTRO = "Spend sprinkles to upgrade Pip's room. Upgrades are yours forever."
export const SHOP_FOOTNOTE = 'Earn sprinkles by logging meals on time, cooking homemade and planning full weeks.'
export const SHOP_MAX_LEVEL_LABEL = '✓ Max level'
export const SHOP_FULLY_UPGRADED = 'Fully upgraded.'
export const SHOP_BUSY_LABEL = 'Upgrading…'
export const SHOP_UPGRADE_ERROR = "Couldn't upgrade. Check your connection and try again. No sprinkles were spent."

// A first tap arms the button; the purchase needs a second tap within this window.
export const SHOP_CONFIRM_MS = 4000

export const SHOP_STATIONS = [
  { key: 'bed', label: 'Bed', icon: '🛏' },
  { key: 'fridge', label: 'Fridge', icon: '🧊' },
  { key: 'cooker', label: 'Cooker', icon: '🍳' },
  { key: 'cabinet', label: 'Trophy cabinet', icon: '🏆' }
]

export const STATION_LEVEL_NAMES = {
  bed: ['Blanket on the floor', 'Camp cot', 'Wooden bed', 'Canopy bed'],
  fridge: ['Cool box', 'Mini fridge', 'Full fridge', 'Double-door fridge'],
  cooker: ['Camping stove', 'Counter and hob', 'Range cooker', "Chef's kitchen"],
  cabinet: ['Planks on bricks', 'Wall shelves', 'Wooden cabinet', 'Glass display cabinet']
}

// Pip's bubble after an upgrade (the award slot, AWARD_BUBBLE_MS).
export const SHOP_UPGRADE_LINES = {
  bed: 'A comfier bed! 😴✨',
  fridge: 'Look at my new fridge! 🧊✨',
  cooker: "New cooker, let's cook! 🍳✨",
  cabinet: 'More room for trophies! 🏆✨'
}
