import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_LINE } from '../../../constants/pipLines'
import { pipForm } from '../pip/lineForms'
import { RB } from './robotForms'

const CX = 100

// Pixel shapes as [column, row] cells around a centre.
const BLOCK = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [-1, -2], [0, -2], [1, -2]]
const CHEVRON = [[-2, 1], [-1, 0], [0, -1], [1, 0], [2, 1]]
const LINE = [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]]
const LID = [[-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
const SMILE = [[-3, -1], [-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0], [3, -1]]
const GRIN = [[-3, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, -1], [-1, 1], [0, 1], [1, 1]]
const FLAT = [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]]
const SMIRK = [[-2, 0], [-1, 0], [0, 0], [1, -1], [2, -2]]

/** The face is light on the screen: chunky pixel shapes in phosphor cyan, two eyes at the eyes anchor. The glow is a drop-shadow filter, removed under body.lowfx. */
export function RobotFace({ form, mood }) {
  const { y: ey, gap, s } = pipForm(PIP_LINE.ROBOT, form).eyes
  const L = CX - gap
  const R = CX + gap
  const my = ey + 15 * s
  const p = 3.2 * s
  const cells = (list, cx, cy) => list.map(([i, j]) => (
    <rect key={`${i},${j}`} x={cx + i * p - p / 2} y={cy + j * p - p / 2} width={p} height={p} fill={RB.glow} />
  ))
  const glow = (children) => <g style={{ filter: `drop-shadow(0 0 ${2 * s}px ${RB.glow})` }}>{children}</g>
  const blush = (
    <>
      <rect x={L - 10 * s} y={ey + 7 * s} width={6 * s} height={2.4 * s} fill={RB.accent} opacity=".85" />
      <rect x={R + 4 * s} y={ey + 7 * s} width={6 * s} height={2.4 * s} fill={RB.accent} opacity=".85" />
    </>
  )
  switch (mood) {
    case PET_MOODS.HAPPY:
      return <>{glow(<>{cells(CHEVRON, L, ey)}{cells(CHEVRON, R, ey)}{cells(GRIN, CX, my)}</>)}{blush}</>
    case PET_MOODS.BORED:
      return glow(<>{cells(LID, L, ey)}{cells(LID, R, ey)}{cells(FLAT, CX, my + p)}</>)
    case PET_MOODS.MISCHIEVOUS:
      return glow(<>{cells(LINE, L, ey)}{cells(BLOCK, R, ey)}{cells(SMIRK, CX, my)}</>)
    case PET_SLEEP_FACE:
      return (
        <g opacity=".45">
          {cells(LINE, L, ey + p)}
          {cells(LINE, R, ey + p)}
          {cells([[0, 0]], CX, my + p)}
        </g>
      )
    default:
      return glow(<>{cells(BLOCK, L, ey)}{cells(BLOCK, R, ey)}{cells(SMILE, CX, my)}</>)
  }
}
