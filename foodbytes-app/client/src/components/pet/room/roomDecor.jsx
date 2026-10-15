import { ROOM_SIZE } from '../../../constants/petRoom'
import { DEFAULT_FLOOR_STYLE, DEFAULT_WALL_STYLE, ROOM_SPOTS, ROOM_STYLES } from '../../../constants/petDecor'
import { Leaf } from './decorArt'
import { P, pts, shade } from './iso'
import { Bill, Box, EllH, IsoLine, RectU } from './isoShapes'
import { RUG, WINDOW_SHIFT, shiftTransform } from './roomLayout'

/**
 * MPP-16 AC 1 + AC 5: the angled corner (left wall, right wall, diamond floor), the
 * window on the right wall and the rug. MPP-17 AC 4: at night the glass turns dark with a
 * moon and a star.
 * MPP-27 AC 4: the walls and floor take the person's chosen styles (ROOM_STYLES), with any pattern
 * drawn under the window, rug and furniture. Each (night, wall, floor) combination is built once
 * and cached (at most 2 × 6 × 4), so React never re-diffs the walls. Unknown ids get the defaults.
 * MPP-39: 260 × 300 floor, 150 walls, skirting + soft corner lines, window moved with the bed.
 */
const SPRIG_STEP = 34
const SPRIG_ROW = 36
const SPRIG_FILL = '#9bd17f'
const BOARD_STEP = 16
const TILE_STEP = 24
const CHECKER_STEP = 25
const SKIRTING_HEIGHT = 7
const { u: ROOM_U, v: ROOM_V, h: WALL_HEIGHT } = ROOM_SIZE
// The window's spot on the right wall after WINDOW_SHIFT, so the sprigs leave it clear.
const WINDOW_GAP = { v0: 158, v1: 238, h0: 66 }
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
  const corner = shade(floor.base, -22)
  return (
    <>
      <polygon points={pts([P(ROOM_U, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(ROOM_U, 0, 0)])} fill={wall.left} />
      <polygon points={pts([P(0, 0, WALL_HEIGHT), P(0, ROOM_V, WALL_HEIGHT), P(0, ROOM_V, 0), P(0, 0, 0)])} fill={wall.right} />
      {wall.sprigs && <WallSprigs />}
      <polygon points={pts([P(0, 0), P(ROOM_U, 0), P(ROOM_U, ROOM_V), P(0, ROOM_V)])} fill={floor.base} />
      <FloorPattern floor={floor} />
      <polygon points={pts([P(ROOM_U, 0, 0), P(0, 0, 0), P(0, 0, SKIRTING_HEIGHT), P(ROOM_U, 0, SKIRTING_HEIGHT)])} fill={wall.skirting} />
      <polygon points={pts([P(0, 0, 0), P(0, ROOM_V, 0), P(0, ROOM_V, SKIRTING_HEIGHT), P(0, 0, SKIRTING_HEIGHT)])} fill={shade(wall.skirting, -6)} />
      <IsoLine points={[P(0, 0, 0), P(0, 0, WALL_HEIGHT)]} width={2.5} color={shade(wall.left, -14)} />
      <IsoLine points={[P(ROOM_U, 0), P(0, 0), P(0, ROOM_V)]} width={2.5} color={corner} />

      <g transform={shiftTransform(WINDOW_SHIFT)}>
        <RectU up={0} v0={94} v1={162} h0={104} h1={164} fill="#ffffff" />
        <RectU up={0} v0={98} v1={158} h0={108} h1={160} fill={night ? NIGHT_GLASS : DAY_GLASS} stroke="none" />
        {night ? NIGHT_SKY : DAY_SKY}
        <RectU up={0} v0={126.5} v1={129.5} h0={108} h1={160} fill="#ffffff" stroke="none" />
        <Box u={0} v={90} du={7} dv={76} h0={100} h1={104} color="#d6c8f2" />
      </g>

      <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG.ru} rv={RUG.rv} fill="#f6c6d6" stroke="#e79ab5" strokeWidth="3" />
      <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG_RING.ru} rv={RUG_RING.rv} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 5" />
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
  for (let u = 20; u < ROOM_U - 10; u += SPRIG_STEP) {
    for (let h = 30; h < WALL_HEIGHT - 5; h += SPRIG_ROW) leaves.push([u, 0, h])
  }
  for (let v = 20; v < ROOM_V - 10; v += SPRIG_STEP) {
    for (let h = 30; h < WALL_HEIGHT - 5; h += SPRIG_ROW) {
      if (!(v > WINDOW_GAP.v0 && v < WINDOW_GAP.v1 && h > WINDOW_GAP.h0)) leaves.push([0, v, h])
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
    for (let v = BOARD_STEP; v < ROOM_V; v += BOARD_STEP) {
      marks.push(<IsoLine key={`b${v}`} points={[P(0, v), P(ROOM_U, v)]} width={1.2} color={floor.boards} />)
    }
  }
  if (floor.grid) {
    for (let k = TILE_STEP; k < ROOM_V; k += TILE_STEP) {
      marks.push(<IsoLine key={`gv${k}`} points={[P(0, k), P(ROOM_U, k)]} width={1.2} color={floor.grid} />)
    }
    for (let k = TILE_STEP; k < ROOM_U; k += TILE_STEP) {
      marks.push(<IsoLine key={`gu${k}`} points={[P(k, 0), P(k, ROOM_V)]} width={1.2} color={floor.grid} />)
    }
  }
  if (floor.checker) {
    for (let a = 0; a * CHECKER_STEP < ROOM_U; a++) {
      for (let b = 0; b * CHECKER_STEP < ROOM_V; b++) {
        if ((a + b) % 2 === 0) continue
        const [u0, v0] = [a * CHECKER_STEP, b * CHECKER_STEP]
        const [u1, v1] = [Math.min(u0 + CHECKER_STEP, ROOM_U), Math.min(v0 + CHECKER_STEP, ROOM_V)]
        marks.push(<polygon key={`c${a}-${b}`} points={pts([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)])} fill={floor.checker} />)
      }
    }
  }
  return marks
}
