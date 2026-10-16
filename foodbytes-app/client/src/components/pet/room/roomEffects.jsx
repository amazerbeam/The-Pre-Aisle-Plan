import { ROOM_INK } from '../../../constants/petRoom'
import { Bill } from './isoShapes'
import { FRIDGE_GAUGE_LIFT, NIGHT_DIM_FILL, SLEEP_Z_LIFT, STATION_ANCHORS } from './roomLayout'
import { fridgeGaugeColour } from '../../../utils/fridgeFill'

const GAUGE_TRACK = 34 // px of fill at 100 % (mockup v5 stockGauge)

/**
 * MPP-17/18/19: the cooker idle scene, the served plate, the fridge gauge and the night scene, from mockup v5's roomSvg().
 * NightDim is HTML, rendered in the stage rather than the SVG (MPP-44).
 * Each takes the station's resolved level (1–4) so it follows upgrades.
 */

/** AC 5: steam over the pot while Pip is at the cooker. */
export function PotSteam({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPot[level - 1]
  return (
    <Bill u={u} v={v} h={h}>
      <g className="pip-steam">
        <path d="M-4 -4 q5 -8 0 -14 M5 -6 q5 -8 0 -14" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </Bill>
  )
}

/** MPP-18 AC 1: the plate on the cooker counter while "<Meal> is served!" shows (mockup v5 PLATE_AT). */
export function ServedPlate({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPlate[level - 1]
  return (
    <Bill u={u} v={v} h={h}>
      <ellipse cx="0" cy="-2" rx="11" ry="4.5" fill="#fff" stroke={ROOM_INK} strokeWidth="1.4" />
      <path d="M-7 -4 q7 -10 14 0z" fill="#f4a259" stroke={ROOM_INK} strokeWidth="1.2" />
      <circle cx="-2" cy="-7" r="1.6" fill="#7cb342" />
      <circle cx="3" cy="-6" r="1.4" fill="#e63946" />
    </Bill>
  )
}

/** MPP-19 AC 4: the stock gauge on top of the fridge (mockup v5 stockGauge), coloured by how full it is. */
export function FridgeGauge({ level, pct }) {
  const [u, v, h] = STATION_ANCHORS.fridgeTop[level - 1]
  const width = (GAUGE_TRACK * pct) / 100
  return (
    <Bill u={u} v={v} h={h + FRIDGE_GAUGE_LIFT}>
      <rect x="-19" y="-7" width="38" height="10" rx="5" fill="#fff" stroke={ROOM_INK} strokeWidth="1.4" />
      {width > 0 && <rect x="-17" y="-5" width={width.toFixed(1)} height="6" rx="3" fill={fridgeGaugeColour(pct)} />}
    </Bill>
  )
}

/** AC 4 / MPP-44: the whole stage dims while Pip sleeps — a screen-fixed layer over the camera-moved world. */
export function NightDim() {
  return <div className="pip-room-night-dim" style={{ background: NIGHT_DIM_FILL }} aria-hidden="true" />
}

/** AC 4: "z z" floating above the sleeping Pip. */
export function SleepZs({ level }) {
  const [u, v, h] = STATION_ANCHORS.bedTop[level - 1]
  return (
    <Bill u={u} v={v} h={h + SLEEP_Z_LIFT}>
      <g className="pip-zzz">
        <text x="10" y="0" fontSize="15" fontWeight="700" fill="#fff">z</text>
        <text x="22" y="-12" fontSize="11" fontWeight="700" fill="#fff">z</text>
      </g>
    </Bill>
  )
}
