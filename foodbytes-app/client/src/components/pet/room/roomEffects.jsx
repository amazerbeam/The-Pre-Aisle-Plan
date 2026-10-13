import { Bill } from './isoShapes'
import { NIGHT_DIM_FILL, SLEEP_Z_LIFT, STATION_ANCHORS } from './roomLayout'

/**
 * MPP-17: the cooker idle scene and the night scene, from mockup v5's roomSvg().
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

/** AC 4: the whole room dims while Pip sleeps. Percentages fill the viewBox. */
export function NightDim() {
  return <rect x="0" y="0" width="100%" height="100%" fill={NIGHT_DIM_FILL} />
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
