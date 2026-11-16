import { P, rectUPoints } from '../../iso'
import { cat, glowG } from '../packShapes'
import { AMBER, GUN, GUN_DK, GUN_LT, HAZ, LIME, NEON, OLIVE, PINK, ROBOT_INK, RUST, STEEL, STEEL_DK } from './robotPalette'
import { HI, INKBLUE, PLATE, bandAt, gear, limb, ringLine } from './robotDecorParts'
import { S, armSeg, dial, hazardU, joint, led, seamsU } from './robotParts'

/**
 * MPP-47: the workshop's back-corner, bedside-nook and foot-of-the-bed decor, 12 items (pip-room-robot.html ROBOT_ROOM.decor lines 1490-1546).
 */
const { poly, box, cyl, cylE, rectH, rectU, ellH, isoLine, bill, fxg } = S

export const ROBOT_FLOOR_BACK_DECOR = {
  /* ---------- back corner (u 2-30, v 32-52, h 0-80) ---------- */
  // a pot of fibre-optic strands with glowing tips
  'snake-plant': () =>
    cat(
      cylE(20, 38.5, 5.4, 5.4, 0, 14, GUN_DK, 6.2, 6.2),
      bandAt(20, 38.5, 5.8, 10, GUN, 1.2),
      ellH(20, 38.5, 14.1, 4.6, 4.6, INKBLUE, { sw: 1 }),
      bill(
        20,
        38.5,
        14,
        glowG(
          NEON,
          <>
            {[[-8, -26, NEON], [-5, -34, PINK], [-2, -38, LIME], [1, -36, AMBER], [4, -38, NEON], [7, -31, PINK], [9, -24, LIME], [-9, -20, AMBER]].map(([x, y, c]) => (
              <g key={`${x}:${y}`}>
                <path d={`M${x * 0.15} 0 Q${x * 0.4} ${y * 0.55} ${x} ${y}`} stroke={c} strokeWidth="1.1" fill="none" strokeLinecap="round" />
                <circle cx={x} cy={y} r="1.7" fill={c} />
              </g>
            ))}
          </>,
          2
        )
      )
    ),
  // a tall spark coil: copper rings up a tapered tower, a buzzing ball on top (animated, glowing)
  cactus: () =>
    cat(
      cylE(16, 42, 7, 7, 0, 10, GUN_DK, 6, 6),
      bandAt(16, 42, 6.6, 5, STEEL_DK, 1.2),
      cylE(16, 42, 4.6, 4.6, 10, 34, STEEL, 2.6, 2.6),
      ...[15, 21, 27].map((h, i) => bandAt(16, 42, 4 - i * 0.6, h, RUST, 1.6)),
      bill(
        16,
        42,
        34,
        glowG(
          NEON,
          fxg(
            'buzz',
            <>
              <circle cy="-5" r="5" fill="#dff7ff" stroke={ROBOT_INK} strokeWidth="1.3" />
              <path d="M-4 -10 l-4 -5 l3 0 l-3 -5 M4 -10 l5 -4 l-3 0 l4 -5" stroke={NEON} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ),
          4
        )
      )
    ),
  // an olive drum bristling with a probe, a grabber and a cable
  'umbrella-stand': () =>
    cat(
      bill(
        16,
        42,
        24,
        <>
          {limb('M-4 0 V-32', 2, STEEL)}
          <circle cx="-4" cy="-34" r="2.4" fill={PINK} stroke={ROBOT_INK} strokeWidth="1.1" />
          {limb('M5 0 V-28', 2, STEEL_DK)}
          <path d="M5 -28 l-3.4 -7 M5 -28 l3.4 -7" stroke={ROBOT_INK} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M5 -28 l-3.4 -7 M5 -28 l3.4 -7" stroke={STEEL} strokeWidth="1.6" strokeLinecap="round" />
          {limb('M0 0 C-3 -10 4 -16 0 -26', 1.6, NEON)}
        </>
      ),
      cylE(16, 42, 6, 6, 0, 12, OLIVE, 7, 7),
      cylE(16, 42, 7, 7, 12, 24, OLIVE, 6, 6),
      bandAt(16, 42, 6.6, 5),
      bandAt(16, 42, 7, 12),
      bandAt(16, 42, 6.4, 19)
    ),
  // a sweeper pole leaning on the wall with a round head, and a dustpan on the floor
  broom: () =>
    cat(
      isoLine([P(8, 40, 14), P(4, 44, 76)], 2.6, STEEL_DK),
      isoLine([P(7.6, 40.3, 16), P(3.6, 44.3, 74)], 1, HI),
      bill(
        8,
        40,
        0.8,
        <>
          <rect x="-9" y="-9" width="18" height="8" rx="3.4" fill={GUN_LT} stroke={ROBOT_INK} strokeWidth="1.4" />
          <path d="M-6 -4.6 h12" stroke={NEON} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="-6" cy="0" r="1.6" fill={GUN_DK} />
          <circle cx="6" cy="0" r="1.6" fill={GUN_DK} />
        </>
      ),
      box(19, 34, 10, 12, 0, 1.5, GUN_DK),
      box(19, 34, 2, 12, 1.5, 5, GUN_LT),
      isoLine([P(27, 40, 1.5), P(25, 38.5, 28)], 2, STEEL_DK),
      isoLine([P(20.5, 35, 1.4), P(27.5, 35, 1.4)], 1, HI)
    ),

  /* ---------- bedside nook (u 2-32, v 140-182, h 0-70) ---------- */
  // a tool cart with an articulated work lamp (animated bulb, glowing)
  'side-table-lamp': () =>
    cat(
      ...[[5, 149], [27, 149], [5, 171], [27, 171]].map(([u, v]) => box(u, v, 2, 2, 0, 28, GUN_DK)),
      box(4, 148, 26, 26, 8, 10, GUN),
      box(9, 152, 12, 10, 10, 16, RUST),
      isoLine([P(11, 157, 16), P(11, 157, 19), P(19, 157, 19), P(19, 157, 16)], 1.2, ROBOT_INK),
      box(3, 147, 28, 28, 28, 31, STEEL_DK),
      rectU(30.05, 152, 170, 14, 26, GUN, { sw: 1 }),
      dial(30.1, 161, 20, 2.2),
      cyl(10, 155, 3, 31, 33, GUN_DK),
      armSeg(P(10, 155, 33), P(14, 158, 50), 2.4),
      armSeg(P(14, 158, 50), P(22, 163, 55), 2.4),
      joint(14, 158, 50, 2),
      ellH(24, 166, 31.1, 5.5, 4.5, '#fff6c2', { stroke: null, op: 0.35 }),
      fxg(
        'buzz',
        glowG(
          '#bff6ff',
          bill(
            22,
            163,
            55,
            <>
              <path d="M-4 -2 L4 -2 L6 3 L-6 3Z" fill={GUN_LT} stroke={ROBOT_INK} strokeWidth="1.2" strokeLinejoin="round" />
              <ellipse cy="3" rx="5" ry="1.6" fill="#eafcff" />
            </>
          ),
          4
        )
      )
    ),
  // a turntable deck on a cabinet: a glowing platter ring, a tonearm and blinking lights (animated)
  'record-player': () =>
    cat(
      box(4, 148, 26, 26, 0, 34, GUN_DK),
      rectU(30, 152, 170, 6, 28, GUN, { sw: 1 }),
      ...[157, 161, 165].map((v) => dial(30.1, v, 17, 2)),
      box(7, 151, 20, 20, 34, 36, GUN),
      cylE(17, 161, 9, 9, 36, 39, INKBLUE, 9, 9),
      glowG(NEON, ringLine(17, 161, 39.2, 7.6, 7.6, 1.2, NEON), 2),
      cyl(17, 161, 1, 39, 41, STEEL),
      isoLine([P(25, 154, 38.5), P(24, 158, 40.5), P(19, 161, 40.5)], 1.8, STEEL),
      led(30.1, 166, 33, LIME, 0),
      led(30.1, 170, 33, AMBER, 0.6)
    ),
  // a power-cell stand: an iron stand holding a glowing capsule (animated, glowing)
  'plant-stand': () =>
    cat(
      ...[[11, 155], [21, 155], [11, 165], [21, 165]].map(([u, v]) => box(u, v, 2, 2, 0, 36, GUN_DK)),
      cyl(17, 161, 9.5, 36, 39, STEEL),
      cylE(17, 161, 6.5, 6.5, 39, 42, GUN, 7.5, 7.5),
      bill(
        17,
        161,
        42,
        <>
          <rect x="-6" y="-24" width="12" height="22" rx="6" fill="#0e2a2a" stroke={ROBOT_INK} strokeWidth="1.5" />
          {glowG(
            LIME,
            fxg(
              'buzz',
              <>
                <rect x="-4" y="-21" width="8" height="16" rx="4" fill={LIME} opacity=".9" />
                <path d="M1 -19 l-3 6 h3 l-1.6 6" stroke="#0e2a2a" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ),
            3
          )}
        </>
      )
    ),
  // a stool with two service manuals and a blinking beacon (animated)
  'stool-books': () =>
    cat(
      ...[[9, 153], [25, 153], [9, 169], [25, 169]].map(([u, v]) => box(u, v, 2, 2, 0, 26, GUN_DK)),
      cyl(17, 161, 11, 26, 30, GUN),
      box(10, 155, 14, 10, 30, 34, '#2f6b8a'),
      poly(rectUPoints(24.02, 156, 164, 30.8, 33.2), '#d9e4ea', { stroke: null }),
      box(11, 156, 12, 9, 34, 37, RUST),
      poly(rectUPoints(23.02, 157, 164, 34.7, 36.3), '#d9e4ea', { stroke: null }),
      led(17, 160, 38, AMBER, 0.3)
    ),

  /* ---------- foot of the bed (u 96-126, v 196-240, h 0-30) ---------- */
  // a steel parts bin: divider seams, label plates and loose cogs inside
  'toy-chest': () =>
    cat(
      box(98, 200, 26, 38, 0, 22, GUN),
      seamsU(124.05, [208, 215, 222, 229], 1, 21, GUN_DK),
      rectU(124.05, 203, 209, 12, 18, HAZ, { sw: 1 }),
      rectU(124.05, 229, 235, 12, 18, HAZ, { sw: 1 }),
      rectH(22.1, 100, 122, 202, 236, INKBLUE, { sw: 1 }),
      gear(110, 212, 22.2, 5, STEEL),
      gear(116, 224, 22.2, 4, AMBER),
      gear(106, 230, 22.2, 3.4, GUN_LT),
      gear(114, 208, 22.2, 3, PINK)
    ),
  // a steel workbench: legs, a rubber-topped slab with a hazard edge and a small vice
  bench: () =>
    cat(
      ...[[99, 201], [118, 201], [99, 233], [118, 233]].map(([u, v]) => box(u, v, 4, 4, 0, 16, GUN_DK)),
      box(98, 200, 24, 36, 16, 20, STEEL_DK),
      rectH(20.1, 100, 120, 202, 234, PLATE, { stroke: null }),
      hazardU(122.05, 201, 235, 16.6, 19.4, 4),
      box(102, 204, 6, 8, 20, 24, RUST),
      box(103, 205, 4, 6, 24, 26, GUN),
      isoLine([P(106, 212, 22), P(112, 216, 23)], 1.8, STEEL)
    ),
  // a mesh scrap bin heaped with cogs and a blinking spark (animated)
  'laundry-basket': () =>
    cat(
      cylE(111, 218, 10, 10, 0, 20, GUN, 12, 12),
      bandAt(111, 218, 10.7, 6, GUN_DK, 1.2),
      bandAt(111, 218, 11.4, 13, GUN_DK, 1.2),
      ellH(111, 218, 20, 10.6, 10.6, INKBLUE, { sw: 1 }),
      gear(108, 216, 20.3, 4, STEEL),
      gear(114, 221, 20.3, 3.4, AMBER),
      gear(112, 213, 20.3, 3, PINK),
      bill(110, 218, 24, fxg('blink', <path d="M0 -3.6 L1 -1 L3.6 0 L1 1 L0 3.6 L-1 1 L-3.6 0 L-1 -1Z" fill="#fff6c2" />, 0.2))
    ),
  // an anti-static mat with a hazard edge and a pair of magnetic boots
  slippers: () =>
    cat(
      box(98, 198, 26, 40, 0, 1.2, PLATE),
      rectH(1.3, 101, 121, 201, 235, 'none', { stroke: HAZ, sw: 1.2 }),
      ...[208, 224].map((v) =>
        cat(
          ellH(110, v, 1.5, 9, 4.2, '#3a4a5c'),
          isoLine([P(102, v, 1.7), P(118, v, 1.7)], 1, NEON),
          cyl(114.5, v, 3.6, 1.5, 5, GUN_LT),
          ellH(104, v, 1.7, 3, 3.2, STEEL, { stroke: null })
        )
      )
    )
}
