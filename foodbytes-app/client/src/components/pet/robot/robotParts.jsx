import { PIP_LINE } from '../../../constants/pipLines'
import { pipForm } from '../pip/lineForms'
import { RB, ROBOT_INK } from './robotForms'

// The monitor head per form (index = form - 1), in the unscaled 200-unit space. The screen is the form's `screen` anchor (robotForms.js).
const ROBOT_HEAD = [
  { x0: 60, x1: 140, y0: 84, y1: 140, ym: 112 },
  { x0: 68, x1: 132, y0: 66, y1: 116, ym: 91 },
  { x0: 74, x1: 126, y0: 50, y1: 96, ym: 73 }
]
const LEG_REACH = [18, 24, 28]

/** Behind the body: side dials on the monitor head and, from the Teen Unit, a trailing cable (slack when drooped). */
export function RobotBack({ form, droop }) {
  const f = pipForm(PIP_LINE.ROBOT, form)
  const h = ROBOT_HEAD[form - 1] ?? ROBOT_HEAD[0]
  const sx = h.x1 - 4
  const sy = h.y1 - 4
  const ex = 100 + f.side + 14
  const ey = f.waist + 4
  const cable = droop
    ? `M${sx} ${sy} C${sx + 14} ${sy + 22} ${ex + 6} ${ey + 18} ${ex} ${ey + 14}`
    : `M${sx} ${sy} C${sx + 22} ${sy + 6} ${ex + 10} ${ey - 20} ${ex} ${ey}`
  return (
    <>
      {[h.x0 - 6, h.x1 + 6].map((x) => (
        <g key={x}>
          <circle cx={x} cy={h.ym} r="6" fill={RB.bolt} stroke={ROBOT_INK} strokeWidth="2.6" />
          <path d={`M${x} ${h.ym - 3.5} V${h.ym}`} stroke={ROBOT_INK} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {form >= 2 && (
        <>
          <path d={cable} stroke={ROBOT_INK} strokeWidth="6.5" fill="none" strokeLinecap="round" />
          <path d={cable} stroke={RB.cable} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
    </>
  )
}

/** Jointed arms at the shoulders, jointed legs root to tip (the foot itself is the wardrobe's: ball or shoe), and shoulder plating on the Android. */
export function RobotLimbs({ form, f }) {
  const fi = form - 1
  const reach = LEG_REACH[fi] ?? LEG_REACH[0]
  return (
    <>
      {[-1, 1].map((dir) => {
        const sx = 100 + dir * (f.side - 3)
        const sy = f.neck + 4
        const ex = 100 + dir * (f.side + 6)
        const ey = sy + reach * 0.5
        const hx = 100 + dir * (f.side + 9)
        const hy = sy + reach
        const d = `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`
        return (
          <g key={dir}>
            <path d={d} stroke={ROBOT_INK} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} stroke={RB.limb} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={ex} cy={ey} r="3.4" fill={RB.bolt} stroke={ROBOT_INK} strokeWidth="2" />
            <circle cx={hx} cy={hy} r="4.8" fill={RB.plate} stroke={ROBOT_INK} strokeWidth="2.4" />
          </g>
        )
      })}
      {f.feet.map(([r, t]) => {
        const d = `M${r[0]} ${r[1] - 4} L${t[0]} ${t[1] - 3}`
        return (
          <g key={t[0]}>
            <path d={d} stroke={ROBOT_INK} strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d={d} stroke={RB.limb} strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        )
      })}
      {fi === 2 && [-1, 1].map((dir) => {
        const cx = 100 + dir * (f.side - 2)
        const cy = f.neck - 6
        return (
          <g key={dir}>
            <ellipse cx={cx} cy={cy} rx="15" ry="11" fill={RB.plate} stroke={ROBOT_INK} strokeWidth="3" />
            <path d={`M${cx - 10} ${cy + 2} Q${cx} ${cy - 6} ${cx + 10} ${cy + 2}`} stroke={RB.glow} strokeWidth="2" fill="none" />
            <circle cx={cx - 8 * dir} cy={cy - 4} r="1.8" fill={RB.bolt} />
            <circle cx={cx + 8 * dir} cy={cy + 3} r="1.8" fill={RB.bolt} />
          </g>
        )
      })}
    </>
  )
}

/** On the body: the monitor screen (dark glass, scanlines, edge glow), a bezel status light, scuffs and rust, a riveted chest patch, and the Android's chest chevron. */
export function RobotDetails({ form, f }) {
  const sc = f.screen
  const hd = ROBOT_HEAD[form - 1] ?? ROBOT_HEAD[0]
  const scanlines = []
  for (let y = sc.y + 5; y < sc.y + sc.h - 3; y += 4) scanlines.push(y)
  const pw = f.side * 0.8
  const ph = (f.waist - f.neck) * 0.5
  const px = 100 + f.side * 0.05
  const py = f.neck + (f.waist - f.neck) * 0.22
  return (
    <>
      <rect x={sc.x} y={sc.y} width={sc.w} height={sc.h} rx={sc.r} fill={RB.screen} stroke={ROBOT_INK} strokeWidth="3" />
      <rect x={sc.x + 2} y={sc.y + 2} width={sc.w - 4} height={sc.h - 4} rx={sc.r - 2} fill="none" stroke={RB.glowSoft} strokeWidth="2" />
      {scanlines.map((y) => (
        <path key={y} d={`M${sc.x + 4} ${y} H${sc.x + sc.w - 4}`} stroke={RB.glow} strokeWidth=".8" opacity=".12" />
      ))}
      <circle cx={sc.x + sc.w - 7} cy={(sc.y + sc.h + hd.y1) / 2} r="1.8" fill={RB.lime} />
      <path d={`M${hd.x0 + 5} ${hd.y0 + 6} l7 2 M${hd.x1 - 12} ${hd.y1 - 4} l6 -2`} stroke={ROBOT_INK} strokeWidth="1.4" opacity=".35" strokeLinecap="round" />
      <ellipse cx={100 - f.side * 0.55} cy={f.waist + 6} rx="4" ry="2.6" fill={RB.rust} opacity=".7" />
      <ellipse cx={hd.x0 + 6} cy={hd.y1 - 6} rx="3" ry="2" fill={RB.rust} opacity=".6" />
      <rect x={px - pw / 2} y={py} width={pw} height={ph} rx="3" fill={RB.patch} stroke={ROBOT_INK} strokeWidth="2"
        transform={`rotate(-4 ${px} ${py + ph / 2})`} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([kx, ky]) => (
        <circle key={`${kx}${ky}`} cx={px + kx * (pw / 2 - 3)} cy={py + ph / 2 + ky * (ph / 2 - 3)} r="1.3" fill={RB.bolt} />
      ))}
      {form === 3 && (
        <path d={`M${100 - f.side * 0.7} ${f.neck - 4} L100 ${f.neck + 2} L${100 + f.side * 0.7} ${f.neck - 4}`}
          stroke={RB.plate} strokeWidth="3" fill="none" strokeLinejoin="round" />
      )}
    </>
  )
}

/** The antenna: a socket and stalk from `base` (it pokes through a hat), rising by the form's growthRise, with a glowing tip. Drooped, it bends over and the tip light dims. */
export function RobotCrown({ form, droop, base }) {
  const h = pipForm(PIP_LINE.ROBOT, form).growthRise
  const tipY = base - h + 6
  const stalk = droop ? `M100 ${base + 2} Q100 ${base - h * 0.45} ${112} ${base - h * 0.5}` : `M100 ${base + 2} V${tipY}`
  const [bx, by] = droop ? [114, base - h * 0.5] : [100, tipY]
  return (
    <>
      <rect x="93" y={base - 2} width="14" height="6" rx="2" fill={RB.plate} stroke={ROBOT_INK} strokeWidth="2.2" />
      <path d={stalk} stroke={ROBOT_INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {!droop && <circle cx={bx} cy={by} r="9" fill={RB.accent} opacity=".25" />}
      <circle cx={bx} cy={by} r="5" fill={droop ? RB.dim : RB.accent} stroke={ROBOT_INK} strokeWidth="2.4" />
    </>
  )
}
