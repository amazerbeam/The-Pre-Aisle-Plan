import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { AMBER, CABLE_DK, GUN, GUN_DK, GUN_LT, LIME, NEON, OLIVE, PINK, ROBOT_INK, SCREEN, STEEL, STEEL_DK } from './robotPalette'
import { HI, PLATE, bandAt, limb, slabU } from './robotDecorParts'
import { S, dial, hazardU, led, neon, slotsU } from './robotParts'

/**
 * MPP-47: the workshop's window dressing and windowsill decor, 10 items (pip-room-robot.html ROBOT_ROOM.decor lines 1373-1434).
 */
const { box, cylE, rectH, rectU, ellH, isoLine, isoLines, bill, fxg } = S

export const ROBOT_WINDOW_DECOR = {
  /* ---------- window dressing (right wall, v 156-244, above the sill) ---------- */
  // a strip curtain: clear plastic strips hanging from a rail on both sides
  'curtains-gingham': () => {
    const strips = (v0) => cat(...Array.from({ length: 5 }, (_, i) => rectU(1.6, v0 + i * 3.2, v0 + i * 3.2 + 2.4, 74, 141, '#9fb4bf', { sw: 0.8, op: 0.6 })))
    return cat(
      box(0.4, 155, 2, 86, 141, 143.5, GUN_DK),
      ...[154, 240.5].map((v) => box(0.4, v, 2, 1.5, 139.5, 146, GUN)),
      strips(158),
      strips(223)
    )
  },
  // blackout shutters: two slatted steel panels with neon edges
  'curtains-linen': () => {
    const left = [[158, 141], [178, 141], [178, 74], [158, 74]]
    const right = left.map(([v, h]) => [396 - v, h])
    const slats = cat(
      ...[[158, 178], [218, 238]].map(([a, b]) => isoLines(Array.from({ length: 10 }, (_, i) => [P(2.2, a, 79 + i * 6.2), P(2.2, b, 79 + i * 6.2)]), 1, GUN_DK, 0.9))
    )
    return cat(
      box(0.4, 155, 2, 86, 141, 143.5, GUN_DK),
      ...[154, 240.5].map((v) => box(0.4, v, 2, 1.5, 139.5, 146, GUN)),
      slabU(0.6, 1.6, left, GUN),
      slabU(0.6, 1.6, right, GUN),
      slats,
      neon([P(2.3, 178, 141), P(2.3, 178, 74)], NEON, 1.2, 2),
      neon([P(2.3, 218, 141), P(2.3, 218, 74)], NEON, 1.2, 2)
    )
  },
  // a security shutter rolled partway: a housing, slats, a hazard bottom bar and guide rails
  'roller-blind': () => {
    const rows = Array.from({ length: 6 }, (_, i) => [P(1.8, 166, 118 + i * 2.9), P(1.8, 230, 118 + i * 2.9)])
    return cat(
      box(0.5, 162, 2, 72, 131, 141, GUN_DK),
      box(0.5, 162, 2, 3, 108, 131, GUN),
      box(0.5, 231, 2, 3, 108, 131, GUN),
      isoLines(rows, 3.4, ROBOT_INK),
      isoLines(rows, 1.8, STEEL_DK),
      hazardU(1.8, 166, 230, 108, 114, 4),
      isoLine([P(2.3, 167, 132), P(2.3, 229, 132)], 1, HI)
    )
  },
  // a window LED border: a cable over the top of the glass and down both sides, lights blinking (animated)
  'window-lights': () => {
    const cols = [NEON, PINK, LIME, AMBER, '#b58cff']
    const wire = Array.from({ length: 13 }, (_, i) => [160 + i * 6.3, 140 - Math.sin((i / 12) * Math.PI) * 8])
    const parts = [isoLine(wire.map(([v, h]) => P(1, v, h)), 2.6, CABLE_DK)]
    wire.slice(1, -1).forEach(([v, h], i) => {
      parts.push(led(1, v, h - 2, cols[i % 5], (i % 6) * 0.3))
    })
    for (const v0 of [160, 236]) {
      const strand = [0, 1, 2, 3, 4, 5].map((k) => [v0 + Math.sin(k) * 2, 136 - k * 13])
      parts.push(isoLine(strand.map(([v, h]) => P(1, v, h)), 2.6, CABLE_DK))
      strand.slice(1).forEach(([v, h], k) => {
        parts.push(led(1, v, h, cols[(k + 2) % 5], k * 0.35))
      })
    }
    return cat(...parts)
  },
  // a hanging grow pod: three cables to a bowl of glowing sprouts (animated flicker, glowing)
  'plant-hanger': () =>
    cat(
      ...[[13, 198], [8, 203], [8, 193]].map(([u, v]) => isoLine([P(8, 198, 150), P(u, v, 130)], 1.3, STEEL_DK)),
      cylE(8, 198, 3.5, 3.5, 120, 130, GUN, 6.6, 6.6),
      ellH(8, 198, 130, 5.6, 5.6, '#0e2a2a', { sw: 1 }),
      ellH(8, 198, 130.2, 3.4, 3.4, '#1f6b4c', { stroke: null }),
      bill(
        8,
        198,
        130.5,
        glowG(
          LIME,
          fxg(
            'buzz',
            <path
              d="M0 0 q-6 -3 -8 -9 q6 0 8 9z M0 0 q6 -5 9 -8 q-1 7 -9 8z M0 -1 q-3 -8 0 -13 q3 5 0 13z"
              fill={LIME}
              stroke={ROBOT_INK}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          ),
          3
        )
      )
    ),

  /* ---------- windowsill (steel ledge at h 74, u 3-14) ---------- */
  // three pots of seedlings under flickering grow lights (animated, glowing)
  'sill-basil': () =>
    cat(
      ...[178, 198, 218].map((v, i) =>
        cat(
          cylE(8.5, v, 3.6, 3.6, 74, 81, GUN, 4.4, 4.4),
          bandAt(8.5, v, 4, 77.5, GUN_DK, 1.1),
          bill(
            8.5,
            v,
            81,
            glowG(
              LIME,
              fxg(
                'buzz',
                <>
                  <path d="M-1 0 v-5" stroke={ROBOT_INK} strokeWidth="1.6" />
                  <path d="M-8 -6 Q-3 -15 2 -6Z" fill={LIME} stroke={ROBOT_INK} strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M-.2 -4 Q2.4 -10 5 -4Z" fill="#c6ff9d" stroke={ROBOT_INK} strokeWidth="1.1" strokeLinejoin="round" />
                </>,
                i * 0.7
              ),
              3
            )
          )
        )
      )
    ),
  // three small clusters of memory chips, each with a lit top
  'sill-succulents': () =>
    cat(
      ...[[178, PINK], [198, NEON], [218, LIME]].map(([v, c]) =>
        cat(
          cylE(8.5, v, 3.4, 3.4, 74, 79, GUN_DK, 4.2, 4.2),
          box(6, v - 3.4, 4, 3.2, 79, 82.5, CABLE_DK),
          rectH(82.6, 6.2, 9.6, v - 3.2, v - 0.4, c, { stroke: null }),
          box(9.4, v - 1, 3.2, 3.2, 79, 86, PLATE),
          rectH(86.1, 9.6, 12.4, v - 0.8, v + 1.8, c, { stroke: null }),
          box(6.6, v + 0.8, 2.6, 2.6, 79, 83, CABLE_DK)
        )
      )
    ),
  // a tall and a squat antenna mast, each tipped with a blinking light (animated)
  'sill-cactus': () =>
    cat(
      cylE(8.5, 186, 4.5, 4.5, 74, 78, GUN_DK, 3.2, 3.2),
      cylE(8.5, 186, 3.2, 3.2, 78, 90, STEEL, 1.2, 1.2),
      isoLine([P(6.4, 186, 85), P(10.6, 186, 85)], 1.4, STEEL),
      led(8.5, 186, 91, PINK, 0),
      cylE(8.5, 214, 3.8, 3.8, 74, 79, GUN_DK, 2.6, 2.6),
      cylE(8.5, 214, 2.6, 2.6, 79, 84, STEEL, 0.9, 0.9),
      isoLine([P(7, 214, 81.5), P(10, 214, 81.5)], 1.3, STEEL),
      led(8.5, 214, 85, LIME, 0.6)
    ),
  // a comms radio: an olive body with a speaker grille, a dial and a blinking light (animated)
  'sill-radio': () =>
    cat(
      box(3.2, 182, 8, 20, 74, 82, OLIVE),
      rectU(11.25, 184, 193, 76, 81, SCREEN, { stroke: null }),
      slotsU(11.3, 185, 192, 77, 80, 3, STEEL_DK, 0.8),
      dial(11.3, 197, 78, 2.2),
      led(11.3, 197, 81, AMBER, 0.2),
      isoLine([P(6, 198, 82), P(5, 200, 98)], 1.4, STEEL),
      led(5, 200, 99, PINK, 0.5)
    ),
  // a waving robo-cat on a plinth: a raised paw and blinking eyes (animated)
  'sill-cat': () =>
    cat(
      box(5.5, 184, 6, 6, 74, 76, GUN_LT),
      bill(
        8.5,
        187,
        76,
        <>
          <path d="M6 -1 Q14 -2 12 -9 Q11 -12 9 -10" fill="none" stroke={ROBOT_INK} strokeWidth="4.6" strokeLinecap="round" />
          <path d="M6 -1 Q14 -2 12 -9 Q11 -12 9 -10" fill="none" stroke={STEEL_DK} strokeWidth="2.2" strokeLinecap="round" />
          {limb('M-4 -8 L-10 -14 L-11 -21', 2.4, STEEL)}
          <circle cx="-11" cy="-22.5" r="2.4" fill={PINK} stroke={ROBOT_INK} strokeWidth="1.1" />
          <ellipse cy="-6" rx="6.5" ry="6.5" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.3" />
          <rect x="-3.4" y="-8.6" width="6.8" height="5.4" rx="1.4" fill={SCREEN} />
          <path d="M-2 -5.6 l2 1.8 l2 -1.8" stroke={PINK} strokeWidth="1" fill="none" strokeLinecap="round" />
          <rect x="-5" y="-20" width="10" height="9" rx="3" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.3" />
          <path d="M-4.6 -19 l-1.2 -4 l3.6 2z M4.6 -19 l1.2 -4 l-3.6 2z" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1" strokeLinejoin="round" />
          {fxg(
            'blink',
            glowG(
              NEON,
              <>
                <rect x="-3.6" y="-17" width="2.4" height="2.4" fill={NEON} />
                <rect x="1.2" y="-17" width="2.4" height="2.4" fill={NEON} />
              </>,
              2
            )
          )}
        </>
      )
    )
}
