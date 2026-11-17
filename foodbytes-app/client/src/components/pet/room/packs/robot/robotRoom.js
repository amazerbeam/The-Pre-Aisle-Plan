import { PIP_LINE } from '../../../../../constants/pipLines'
import { ROOM_LABELS } from '../../../../../constants/petRoomLabels'
import { ROBOT_INK } from './robotPalette'
import { ROBOT_STYLES, robotBackdrop, robotSill } from './robotShell'
import { ROBOT_BED } from './robotBed'
import { ROBOT_FRIDGE } from './robotFridge'
import { ROBOT_COOKER } from './robotCooker'
import { ROBOT_CABINET } from './robotCabinet'
import { ROBOT_WARDROBE } from './robotWardrobeStation'
import { ROBOT_DECOR } from './robotDecor'
import { FridgeGauge, PotSteam, ServedPlate, SleepZs } from './robotEffects'

/** MPP-45/47: the robot workshop (pip-room-robot.html ROBOT_ROOM, approved 2026-11-16). */
export const ROBOT_ROOM = {
  line: PIP_LINE.ROBOT,
  ink: ROBOT_INK,
  surround: ROBOT_INK,
  styles: ROBOT_STYLES,
  backdrop: robotBackdrop,
  sill: robotSill,
  stations: { bed: ROBOT_BED, fridge: ROBOT_FRIDGE, cooker: ROBOT_COOKER, cabinet: ROBOT_CABINET, wardrobe: ROBOT_WARDROBE },
  decor: ROBOT_DECOR,
  effects: { FridgeGauge, PotSteam, ServedPlate, SleepZs },
  // What animates, by target (pip-room-robot.html lines 1654-1676).
  ambience: [
    { target: 'shell', effect: 'buzz' }, // the neon sign above the fridge
    { target: 'shell', effect: 'fan' }, // the wall vent fan
    { target: 'window', effect: 'rain' }, // rain on the night pane
    { target: 'bed', effect: 'blink' }, // the pod's status LEDs
    { target: 'bed', effect: 'scan' }, // the headboard and spine screens
    { target: 'fridge', effect: 'blink' }, // the cryo status lights
    { target: 'fridge', effect: 'scan' }, // the cryo bank's control screen
    { target: 'cooker', effect: 'blink' }, // the oven status lights
    { target: 'cooker', effect: 'scan' }, // the fab oven displays
    { target: 'cooker', effect: 'fan' }, // the hood duct fan at the full fab line
    { target: 'cabinet', effect: 'scan' }, // the holo trophy
    { target: 'wardrobe', effect: 'scan' }, // the locker bay screen
    { target: 'wardrobe', effect: 'blink' }, // the locker status lights
    // decor
    { target: 'fairy-lights', effect: 'blink' }, { target: 'recipe-board', effect: 'scan' }, { target: 'pip-portrait', effect: 'scan' }, { target: 'photo-strip', effect: 'scan' },
    { target: 'wall-sconce', effect: 'buzz' }, { target: 'wall-clock', effect: 'blink' }, { target: 'bunting', effect: 'blink' }, { target: 'mirror', effect: 'scan' },
    { target: 'window-lights', effect: 'blink' }, { target: 'plant-hanger', effect: 'buzz' }, { target: 'sill-basil', effect: 'buzz' }, { target: 'sill-cactus', effect: 'blink' },
    { target: 'sill-radio', effect: 'blink' }, { target: 'sill-cat', effect: 'blink' },
    { target: 'cactus', effect: 'buzz' }, { target: 'side-table-lamp', effect: 'buzz' }, { target: 'record-player', effect: 'blink' }, { target: 'plant-stand', effect: 'buzz' },
    { target: 'stool-books', effect: 'blink' }, { target: 'laundry-basket', effect: 'blink' },
    { target: 'lemon-tree', effect: 'blink' }, { target: 'monstera', effect: 'blink' }, { target: 'arc-lamp', effect: 'buzz' }, { target: 'tea-table', effect: 'buzz' }, { target: 'pip-ball', effect: 'buzz' }
  ],
  labels: ROOM_LABELS[PIP_LINE.ROBOT]
}
