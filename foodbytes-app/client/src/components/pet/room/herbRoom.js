import { PIP_LINE } from '../../../constants/pipLines'
import { ROOM_INK } from '../../../constants/petRoom'
import { ROOM_STYLES } from '../../../constants/petDecor'
import { ROOM_LABELS } from '../../../constants/petRoomLabels'
import { decorArt } from './decorArt'
import { stationArt } from './furniture'
import { roomBackdrop } from './roomDecor'
import { FridgeGauge, PotSteam, ServedPlate, SleepZs } from './roomEffects'

/** MPP-45: the herb room = today's art, unchanged. Its own caches (stationArt, roomBackdrop, decorArt) stay in charge. */
export const HERB_ROOM = {
  line: PIP_LINE.HERB,
  ink: ROOM_INK,
  styles: ROOM_STYLES,
  backdropById: roomBackdrop,
  stationById: stationArt,
  decorById: decorArt,
  stations: {},
  decor: {},
  effects: { FridgeGauge, PotSteam, ServedPlate, SleepZs },
  ambience: [],
  labels: ROOM_LABELS[PIP_LINE.HERB]
}
