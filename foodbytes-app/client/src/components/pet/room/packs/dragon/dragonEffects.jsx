import { fridgeGaugeColour } from '../../../../../utils/fridgeFill'
import { FRIDGE_GAUGE_LIFT, SLEEP_Z_LIFT, STATION_ANCHORS } from '../../roomLayout'
import { fmt } from '../packShapes'
import { DRAGON_INK } from './dragonPalette'
import { S } from './dragonParts'

/**
 * MPP-45: the dragon lair's effects as components (pip-room-dragon.html DRAGON_ROOM.effects, lines 1818-1851), props as
 * roomEffects.jsx. `nightDim` is not ported: the live NightDim HTML layer already exists. Like the mockup, each is drawn in its
 * station's own art coords, so PetRoom places it inside that station's shifted group.
 */
const { bill, fxg } = S
const GAUGE_TRACK = 34 // px of fill at 100 %

/** Frost gauge: an ice-framed track filling with frost, in the live gauge colours, at STATION_ANCHORS.fridgeTop + the live lift. */
export function FridgeGauge({ level, pct }) {
  const [u, v, h] = STATION_ANCHORS.fridgeTop[level - 1]
  const w = (GAUGE_TRACK * pct) / 100
  const spikes = []
  for (let x = 0; x < w - 3; x += 5) spikes.push(<path key={x} d={`M${fmt(-17 + x)} -2 l2 -3 l2 3z`} fill="#ffffff" opacity=".85" />)
  return bill(
    u,
    v,
    h + FRIDGE_GAUGE_LIFT,
    <>
      <rect x="-19" y="-7" width="38" height="10" rx="5" fill="#eaf8ff" stroke={DRAGON_INK} strokeWidth="1.4" />
      {w > 0 && (
        <>
          <rect x="-17" y="-5" width={fmt(w)} height="6" rx="3" fill={fridgeGaugeColour(pct)} />
          {spikes}
        </>
      )}
      <path d="M-24 -2 l3 -3 l3 3 l-3 3z M21 -2 l3 -3 l3 3 l-3 3z" fill="#bfeaff" stroke={DRAGON_INK} strokeWidth="1" />
    </>
  )
}

/** Steam off the cauldron: three wisps rising and fading (animated). */
export function PotSteam({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPot[level - 1]
  return bill(
    u,
    v,
    h,
    fxg('steam', <path d="M-6 -3 q5 -8 0 -14 M2 -4 q6 -9 0 -16 M9 -2 q5 -7 0 -12" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".92" />)
  )
}

const zRing = (x, y, r, size) => (
  <>
    <circle cx={x} cy={y} r={r} fill="#ffffff" opacity=".9" stroke="#8d8a98" strokeWidth="1.2" />
    <text x={x} y={y + size * 0.36} fontSize={size} fontWeight="700" textAnchor="middle" fill="#5d5a68" fontFamily="system-ui,sans-serif">
      z
    </text>
  </>
)

/** Smoke-ring Zs above the nest, drifting up (animated). */
export function SleepZs({ level }) {
  const [u, v, h] = STATION_ANCHORS.bedTop[level - 1]
  return bill(
    u,
    v,
    h + SLEEP_Z_LIFT,
    fxg(
      'zzz',
      <>
        {zRing(14, 0, 8, 12)}
        {zRing(27, -14, 6, 9)}
      </>
    )
  )
}

/** The dish that appears when a meal is served: a wooden trencher with a roast leg. */
export function ServedPlate({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPlate[level - 1]
  return bill(
    u,
    v,
    h,
    <>
      <ellipse cx="0" cy="-2" rx="12" ry="5" fill="#a8723d" stroke={DRAGON_INK} strokeWidth="1.4" />
      <ellipse cx="0" cy="-3" rx="9" ry="3.2" fill="#c8924f" />
      <path d="M-6 -4 q6 -10 13 -3 q1 4 -3 5 q-6 1 -10 -2z" fill="#b5502e" stroke={DRAGON_INK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 -6 l5 -4" stroke="#f4ead2" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="-10" r="1.8" fill="#f4ead2" stroke={DRAGON_INK} strokeWidth=".8" />
    </>
  )
}
