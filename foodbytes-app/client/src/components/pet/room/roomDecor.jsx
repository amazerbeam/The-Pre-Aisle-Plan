import { P, pts } from './iso'
import { Bill, Box, EllH, RectU } from './isoShapes'
import { RUG } from './roomLayout'

/**
 * MPP-16 AC 1 + AC 5: the angled corner (left wall, right wall, diamond floor), the
 * window on the right wall and the rug. MPP-17 AC 4: at night the glass turns dark with a
 * moon and a star. Both versions are built once as module constants, so React never
 * re-diffs the walls.
 */
const WALL_LENGTH = 193
const WALL_HEIGHT = 180
const RUG_RING = { ru: 40, rv: 30 }
const DAY_GLASS = '#cfe8ff'
const NIGHT_GLASS = '#2b2d5c'
const SKY_GLOW = '#fff6c2'

const DAY_SKY = (
  <Bill u={0} v={145} h={146}>
    <circle r="6" fill={SKY_GLOW} />
  </Bill>
)

const NIGHT_SKY = (
  <>
    <Bill u={0} v={140} h={146}>
      <path d="M0 -8 a8 8 0 1 0 6 13 a6 6 0 1 1 -6 -13z" fill={SKY_GLOW} />
    </Bill>
    <Bill u={0} v={108} h={150}>
      <circle r="1.4" fill="#fff" />
    </Bill>
  </>
)

function buildBackdrop(night) {
  return (
    <>
      <polygon
        points={pts([P(WALL_LENGTH, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(WALL_LENGTH, 0, 0)])}
        fill="#ece5fb"
      />
      <polygon
        points={pts([P(0, 0, WALL_HEIGHT), P(0, WALL_LENGTH, WALL_HEIGHT), P(0, WALL_LENGTH, 0), P(0, 0, 0)])}
        fill="#e3daf8"
      />
      <polygon points={pts([P(0, 0), P(WALL_LENGTH, 0), P(WALL_LENGTH, WALL_LENGTH), P(0, WALL_LENGTH)])} fill="#d6c9f0" />
      <path d="M180 0 V180" stroke="#cbbdea" strokeWidth="2" />
      <polyline points={pts([P(WALL_LENGTH, 0), P(0, 0), P(0, WALL_LENGTH)])} stroke="#c4b4e6" strokeWidth="3" fill="none" />

      <RectU up={0} v0={94} v1={162} h0={104} h1={164} fill="#ffffff" />
      <RectU up={0} v0={98} v1={158} h0={108} h1={160} fill={night ? NIGHT_GLASS : DAY_GLASS} stroke="none" />
      {night ? NIGHT_SKY : DAY_SKY}
      <RectU up={0} v0={126.5} v1={129.5} h0={108} h1={160} fill="#ffffff" stroke="none" />
      <Box u={0} v={90} du={7} dv={76} h0={100} h1={104} color="#d6c8f2" />

      <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG.ru} rv={RUG.rv} fill="#f6c6d6" stroke="#e79ab5" strokeWidth="3" />
      <EllH
        cu={RUG.cu}
        cv={RUG.cv}
        h={0}
        ru={RUG_RING.ru}
        rv={RUG_RING.rv}
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeDasharray="6 5"
      />
    </>
  )
}

export const ROOM_BACKDROP = {
  day: buildBackdrop(false),
  night: buildBackdrop(true)
}
