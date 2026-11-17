import { PIP_LINE } from '../../../../../constants/pipLines'
import { ROOM_LABELS } from '../../../../../constants/petRoomLabels'
import { DRAGON_INK } from './dragonPalette'
import { DRAGON_STYLES, dragonBackdrop, dragonSill } from './dragonShell'
import { DRAGON_BED } from './dragonBed'
import { DRAGON_FRIDGE } from './dragonFridge'
import { DRAGON_COOKER } from './dragonCooker'
import { DRAGON_CABINET } from './dragonCabinet'
import { DRAGON_WARDROBE } from './dragonWardrobeStation'
import { DRAGON_DECOR } from './dragonDecor'
import { FridgeGauge, PotSteam, ServedPlate, SleepZs } from './dragonEffects'

/** MPP-45/46: the dragon lair (pip-room-dragon.html DRAGON_ROOM, approved 2026-11-16). */
export const DRAGON_ROOM = {
  line: PIP_LINE.DRAGON,
  ink: DRAGON_INK,
  surround: DRAGON_INK,
  styles: DRAGON_STYLES,
  backdrop: dragonBackdrop,
  sill: dragonSill,
  stations: { bed: DRAGON_BED, fridge: DRAGON_FRIDGE, cooker: DRAGON_COOKER, cabinet: DRAGON_CABINET, wardrobe: DRAGON_WARDROBE },
  decor: DRAGON_DECOR,
  effects: { FridgeGauge, PotSteam, ServedPlate, SleepZs },
  // What animates, by target (pip-room-dragon.html lines 1853-1869).
  ambience: [
    { target: 'shell', effect: 'flicker' }, // the two wall torches
    { target: 'shell', effect: 'sway' }, // the banner
    { target: 'window', effect: 'glint' }, // stars at night
    { target: 'cooker', effect: 'flicker' }, // the fire
    { target: 'cooker', effect: 'embers' }, // sparks rising from the hearth
    { target: 'bed', effect: 'glint' }, // coins and gems on the hoard
    { target: 'bed', effect: 'flicker' }, // the candelabra at the L4 hoard
    { target: 'cabinet', effect: 'glint' }, // the trophies and the gold
    // decor
    { target: 'fairy-lights', effect: 'glint' }, { target: 'wall-sconce', effect: 'flicker' }, { target: 'photo-strip', effect: 'glint' },
    { target: 'bunting', effect: 'sway' }, { target: 'window-lights', effect: 'glint' },
    { target: 'plant-hanger', effect: 'flicker' }, { target: 'plant-hanger', effect: 'embers' },
    { target: 'sill-basil', effect: 'glint' }, { target: 'sill-radio', effect: 'flicker' }, { target: 'sill-cat', effect: 'flicker' },
    { target: 'side-table-lamp', effect: 'flicker' }, { target: 'plant-stand', effect: 'glint' }, { target: 'stool-books', effect: 'flicker' }, { target: 'laundry-basket', effect: 'glint' },
    { target: 'lemon-tree', effect: 'glint' }, { target: 'arc-lamp', effect: 'flicker' }, { target: 'arc-lamp', effect: 'embers' }, { target: 'tea-table', effect: 'flicker' }, { target: 'pip-ball', effect: 'glint' }
  ],
  labels: ROOM_LABELS[PIP_LINE.DRAGON]
}
