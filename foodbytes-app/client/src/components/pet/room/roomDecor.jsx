import { DEFAULT_FLOOR_STYLE, DEFAULT_WALL_STYLE, ROOM_SPOTS, ROOM_STYLES } from '../../../constants/petDecor'
import { Leaf } from './decorArt'
import { P, pts } from './iso'
import { Bill, Box, EllH, IsoLine, RectU } from './isoShapes'
import { RUG } from './roomLayout'

/**
 * MPP-16 AC 1 + AC 5: the angled corner (left wall, right wall, diamond floor), the
 * window on the right wall and the rug. MPP-17 AC 4: at night the glass turns dark with a
 * moon and a star.
 * MPP-27 AC 4: the walls and floor take the person's chosen styles (ROOM_STYLES), with any pattern
 * drawn under the window, rug and furniture. Each (night, wall, floor) combination is built once
 * and cached (at most 2 × 5 × 4), so React never re-diffs the walls. Unknown ids get the defaults.
 */
const SPRIG_STEP = 34
const SPRIG_ROW = 36
const SPRIG_FILL = '#9bd17f'
const BOARD_STEP = 16
const TILE_STEP = 24
const CHECKER_CELLS = 8
const CHECKER_STEP = 24.1
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

function buildBackdrop(night, wall, floor) {
  return (
    <>
      <polygon
        points={pts([P(WALL_LENGTH, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(WALL_LENGTH, 0, 0)])}
        fill={wall.left}
      />
      <polygon
        points={pts([P(0, 0, WALL_HEIGHT), P(0, WALL_LENGTH, WALL_HEIGHT), P(0, WALL_LENGTH, 0), P(0, 0, 0)])}
        fill={wall.right}
      />
      {wall.sprigs && <WallSprigs />}
      <polygon points={pts([P(0, 0), P(WALL_LENGTH, 0), P(WALL_LENGTH, WALL_LENGTH), P(0, WALL_LENGTH)])} fill={floor.base} />
      <FloorPattern floor={floor} />
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

const backdrops = new Map()

/** The room's walls, floor, window and rug for one (night, wall style, floor style). */
export function roomBackdrop(night, wallStyleId, floorStyleId) {
  const wallId = ROOM_STYLES[wallStyleId]?.spot === ROOM_SPOTS.WALL_STYLE ? wallStyleId : DEFAULT_WALL_STYLE
  const floorId = ROOM_STYLES[floorStyleId]?.spot === ROOM_SPOTS.FLOOR_STYLE ? floorStyleId : DEFAULT_FLOOR_STYLE
  const key = `${night ? 'night' : 'day'}|${wallId}|${floorId}`
  if (!backdrops.has(key)) backdrops.set(key, buildBackdrop(night, ROOM_STYLES[wallId], ROOM_STYLES[floorId]))
  return backdrops.get(key)
}

// Faint leaves on both walls (mockup wallsSvg), none where the window covers the right wall.
function WallSprigs() {
  const leaves = []
  for (let u = 20; u < 190; u += SPRIG_STEP) {
    for (let h = 30; h < 175; h += SPRIG_ROW) leaves.push([u, 0, h])
  }
  for (let v = 20; v < 190; v += SPRIG_STEP) {
    for (let h = 30; h < 175; h += SPRIG_ROW) {
      if (!(v > 88 && v < 168 && h > 96)) leaves.push([0, v, h])
    }
  }
  return leaves.map(([u, v, h]) => (
    <Bill key={`${u}-${v}-${h}`} u={u} v={v} h={h}>
      <g opacity="0.45"><Leaf fill={SPRIG_FILL} /></g>
    </Bill>
  ))
}

// Boards, a tile grid or a checkerboard over the floor colour (mockup floorSvg).
function FloorPattern({ floor }) {
  const marks = []
  if (floor.boards) {
    for (let v = BOARD_STEP; v < WALL_LENGTH; v += BOARD_STEP) {
      marks.push(<IsoLine key={`b${v}`} points={[P(0, v), P(WALL_LENGTH, v)]} width={1.2} color={floor.boards} />)
    }
  }
  if (floor.grid) {
    for (let k = TILE_STEP; k < WALL_LENGTH; k += TILE_STEP) {
      marks.push(<IsoLine key={`gv${k}`} points={[P(0, k), P(WALL_LENGTH, k)]} width={1.2} color={floor.grid} />)
      marks.push(<IsoLine key={`gu${k}`} points={[P(k, 0), P(k, WALL_LENGTH)]} width={1.2} color={floor.grid} />)
    }
  }
  if (floor.checker) {
    for (let a = 0; a < CHECKER_CELLS; a++) {
      for (let b = 0; b < CHECKER_CELLS; b++) {
        if ((a + b) % 2 === 0) continue
        const cell = [P(a * CHECKER_STEP, b * CHECKER_STEP), P((a + 1) * CHECKER_STEP, b * CHECKER_STEP),
          P((a + 1) * CHECKER_STEP, (b + 1) * CHECKER_STEP), P(a * CHECKER_STEP, (b + 1) * CHECKER_STEP)]
        marks.push(<polygon key={`c${a}-${b}`} points={pts(cell)} fill={floor.checker} />)
      }
    }
  }
  return marks
}
