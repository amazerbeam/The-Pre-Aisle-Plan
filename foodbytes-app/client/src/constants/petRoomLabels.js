import { PIP_DEFAULT_LINE, PIP_LINE } from './pipLines.js'
import { SHOP_STATIONS, STATION_LEVEL_NAMES } from './petShop.js'
import { DECOR_ITEMS, ROOM_STYLES } from './petDecor.js'

/**
 * MPP-45/46/47: station, level, style and decor names per Pip line.
 * Herb reads today's constants; dragon / robot are copied from the approved room mockups' `labels`.
 */
const HERB_LABELS = {
  stations: Object.fromEntries(SHOP_STATIONS.map(s => [s.key, s.label])),
  levels: STATION_LEVEL_NAMES,
  styles: Object.fromEntries(Object.entries(ROOM_STYLES).map(([id, s]) => [id, s.label])),
  decor: Object.fromEntries(Object.entries(DECOR_ITEMS).map(([id, d]) => [id, d.label]))
}

// pip-room-dragon.html DRAGON_ROOM.labels (approved 2026-11-16).
const DRAGON_LABELS = {
  stations: { bed: 'Nest', fridge: 'Ice chest', cooker: 'Forge hearth', cabinet: 'Hoard', wardrobe: 'Armour rack' },
  levels: {
    bed: ['Straw nest', 'Fur nest', 'Coin nest', 'Gold-pile nest'],
    fridge: ['Ice chest', 'Iron frost locker', 'Cold-cellar door', 'Frost vault'],
    cooker: ['Campfire pot', 'Stone hearth', 'Forge hearth', 'Great forge'],
    cabinet: ['Hoard chest', 'Shelf hoard', 'Hoard niche', 'Treasure alcove'],
    wardrobe: ['Peg frame', 'Armour stand', 'Armour rack', 'Armoury wall']
  },
  styles: {
    'wall-white': 'Grey stone', 'wall-lavender': 'Cold slate', 'wall-mint': 'Mossy stone', 'wall-peach': 'Ember stone', 'wall-sky': 'Sandstone', 'wall-sprig': 'Ivy-hung stone',
    'floor-lilac': 'Cave earth', 'floor-oak': 'Flagstones', 'floor-terracotta': 'Slate tiles', 'floor-checker': 'Rune tiles'
  },
  decor: {
    // over the wardrobe
    'basil-print': 'Mounted dragon scale', 'recipe-board': 'Rune slate', 'herb-shelf': 'Potion shelf', 'fairy-lights': 'Crystal string', 'pip-portrait': 'Hatchling portrait',
    // bedside wall
    'growth-chart': 'Claw-mark height post', 'meal-calendar': 'Carved tally stone', 'wall-sconce': 'Wall torch', 'photo-strip': 'Gem frames',
    // front right wall
    'wall-clock': 'Wall hourglass', bunting: 'Tattered pennants', 'pan-rail': 'Iron cauldron rail', mirror: 'Polished buckler', 'coat-hooks': 'Cloak hooks',
    // window dressing
    'curtains-gingham': 'Patchwork hide curtains', 'curtains-linen': 'Crimson drapes', 'roller-blind': 'Iron portcullis', 'window-lights': 'Glowworm strings', 'plant-hanger': 'Hanging brazier',
    // windowsill
    'sill-basil': 'Glowcap pots', 'sill-succulents': 'Gem clusters', 'sill-cactus': 'Stalagmite pair', 'sill-radio': 'Echo horn', 'sill-cat': 'Golden dragon idol',
    // rug
    'rug-pink': 'Crimson rug', 'rug-braided': 'Braided hide rug', 'rug-leaf': 'Scale rug', 'rug-stripe': 'Banner-stripe rug', 'rug-picnic': 'Feast blanket', 'rug-sheepskin': 'Cave-bear pelt',
    // back corner
    'snake-plant': 'Cave fern urn', cactus: 'Thorn tree', 'umbrella-stand': 'Weapon barrel', broom: 'Hearth rake and shovel',
    // bedside nook
    'side-table-lamp': 'Table and lantern', 'record-player': 'Table and war drum', 'plant-stand': 'Egg stand', 'stool-books': 'Stool and tomes',
    // foot of the bed
    'toy-chest': 'Treasure chest', bench: 'Stone bench', 'laundry-basket': 'Loot basket', slippers: 'Hide mat and claw boots',
    // by the fridge
    'watering-can': 'Copper ewer', 'cookbook-stack': 'Spellbook stack', 'bean-bag': 'Hide cushion', 'lemon-tree': 'Ember-fruit tree', 'veg-basket': 'Forage basket',
    // corner by the door
    monstera: 'Glowvein plant', 'coat-stand': 'Cloak and helm stand', 'arc-lamp': 'Standing brazier', guitar: 'Dragon-hide lute',
    // front of the room
    pouffe: 'Stump seat', 'tea-table': 'Feast table', 'pip-ball': "Pip's glow-orb", 'picnic-basket': 'Provision crate'
  }
}

// pip-room-robot.html ROBOT_ROOM.labels (approved 2026-11-16).
const ROBOT_LABELS = {
  stations: { bed: 'Charging pod', fridge: 'Cryo unit', cooker: 'Fab oven', cabinet: 'Display case', wardrobe: 'Gear locker' },
  levels: {
    bed: ['Charging mat', 'Charging cradle', 'Charging pod', 'Canopy pod'],
    fridge: ['Cooler box', 'Mini cryo unit', 'Cryo fridge', 'Twin cryo bank'],
    cooker: ['Hot plate', 'Countertop fab oven', 'Fab oven with arm', 'Full fab line'],
    cabinet: ['Shelf crate', 'Display case', 'Lit display case', 'Holo plinth case'],
    wardrobe: ['Hook rail', 'Gear locker', 'Double locker', 'Locker bay']
  },
  decor: {
    // over the wardrobe
    'basil-print': 'Circuit poster', 'recipe-board': 'Schematic slate', 'herb-shelf': 'Sample rack', 'fairy-lights': 'LED strip', 'pip-portrait': 'Pip scan portrait',
    // bedside wall
    'growth-chart': 'Height gauge', 'meal-calendar': 'Schedule panel', 'wall-sconce': 'Work lamp', 'photo-strip': 'Monitor stack',
    // front right wall
    'wall-clock': 'Digital clock', bunting: 'Pennant lights', 'pan-rail': 'Tool rail', mirror: 'Round monitor', 'coat-hooks': 'Gear hooks',
    // window dressing
    'curtains-gingham': 'Strip curtain', 'curtains-linen': 'Blackout shutters', 'roller-blind': 'Security shutter', 'window-lights': 'Window LED border', 'plant-hanger': 'Hanging grow pod',
    // windowsill
    'sill-basil': 'Grow-light seedlings', 'sill-succulents': 'Memory chips', 'sill-cactus': 'Antenna pair', 'sill-radio': 'Comms radio', 'sill-cat': 'Robo-cat',
    // rug
    'rug-pink': 'Rubber mat', 'rug-braided': 'Anti-static mat', 'rug-leaf': 'Circuit mat', 'rug-stripe': 'Hazard mat', 'rug-picnic': 'Tool-outline mat', 'rug-sheepskin': 'Foam pad',
    // back corner
    'snake-plant': 'Fibre-optic plant', cactus: 'Spark coil', 'umbrella-stand': 'Probe drum', broom: 'Sweeper pole',
    // bedside nook
    'side-table-lamp': 'Tool cart and work lamp', 'record-player': 'Turntable deck', 'plant-stand': 'Power-cell stand', 'stool-books': 'Stool and manuals',
    // foot of the bed
    'toy-chest': 'Parts bin', bench: 'Steel workbench', 'laundry-basket': 'Scrap bin', slippers: 'Boot mat',
    // by the fridge
    'watering-can': 'Coolant can', 'cookbook-stack': 'Tablet stack', 'bean-bag': 'Crash cushion', 'lemon-tree': 'Hydroponic tube', 'veg-basket': 'Battery crate',
    // corner by the door
    monstera: 'Dish stand', 'coat-stand': 'Hard-hat stand', 'arc-lamp': 'Work-light tripod', guitar: 'Synth keyboard',
    // front of the room
    pouffe: 'Swivel stool', 'tea-table': 'Holo table', 'pip-ball': 'Drone ball', 'picnic-basket': 'Cargo case'
  },
  styles: {
    'wall-white': 'Gunmetal', 'wall-lavender': 'Olive drab', 'wall-mint': 'Teal panel', 'wall-peach': 'Rust orange', 'wall-sky': 'Steel blue', 'wall-sprig': 'Circuit board',
    'floor-lilac': 'Rubber mat', 'floor-oak': 'Diamond plate', 'floor-terracotta': 'Floor grate', 'floor-checker': 'Hazard checker'
  }
}

export const ROOM_LABELS = {
  [PIP_LINE.HERB]: HERB_LABELS,
  [PIP_LINE.DRAGON]: DRAGON_LABELS,
  [PIP_LINE.ROBOT]: ROBOT_LABELS
}

const labelsOf = (line) => ROOM_LABELS[line] ?? ROOM_LABELS[PIP_DEFAULT_LINE]

export const stationLabel = (line, station) => labelsOf(line).stations[station] ?? HERB_LABELS.stations[station] ?? station
export const stationLevelName = (line, station, level) => (labelsOf(line).levels[station] ?? HERB_LABELS.levels[station])?.[level - 1]
export const styleLabel = (line, styleId) => labelsOf(line).styles[styleId] ?? HERB_LABELS.styles[styleId]
export const decorLabel = (line, id) => labelsOf(line).decor?.[id] ?? HERB_LABELS.decor[id]
