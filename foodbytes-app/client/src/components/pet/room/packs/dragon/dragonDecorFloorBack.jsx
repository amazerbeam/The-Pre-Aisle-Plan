import { P, rectUPoints } from '../../iso'
import { cat, glow, glowG, nearRange } from '../packShapes'
import { CLOAK, DRAGON_INK, GOLD, IRON, IRON_LT, STONE, STONE_DK, WOOD, WOOD_DK, WOOD_LT } from './dragonPalette'
import { BONE, GLOW, HI, TEAL, bandAt, candle, ellU, limb } from './dragonDecorParts'
import { coinScatter, flame, gem, S, seamsU, sparkle, stoneBox } from './dragonParts'

/**
 * MPP-46: the lair's 12 back-floor decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, back corner, bedside nook and foot of
 * the bed). World coords.
 */
const { poly, isoLine, box, rectU, rectH, cylE, cyl, ellH, bill } = S
const INK = DRAGON_INK

export const DRAGON_FLOOR_BACK_DECOR = {
  /* ---------- back corner (u 2-30, v 32-52, h 0-80) ---------- */
  // a stone urn of cave ferns with glowing tips
  'snake-plant': () =>
    cat(
      cylE(20, 38.5, 5.4, 5.4, 0, 14, STONE, 6.2, 6.2),
      bandAt(20, 38.5, 5.8, 10, STONE_DK, 1.2),
      ellH(20, 38.5, 14.1, 4.6, 4.6, '#3a2a1e', { sw: 1 }),
      bill(
        20,
        38.5,
        14,
        cat(
          ...[[-5, -32, -3], [-1.5, -40, 0], [2.5, -35, 2], [5.5, -26, 5]].map(([x, y, t]) => (
            <>
              <path
                d={`M${x - 2} 0 Q${x - 2 + t / 2} ${y / 2} ${x + t / 2} ${y} Q${x + 2 + t / 2} ${y / 2} ${x + 2} 0z`}
                fill="#2f8f7a"
                stroke={INK}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d={`M${x} -2 Q${x + t * 0.45} ${y / 2} ${x + t / 2} ${y + 3}`} stroke="#8fe0cc" strokeWidth="1" fill="none" strokeLinecap="round" />
              <circle cx={x + t / 2} cy={y} r="1.7" fill={GLOW} {...glow(GLOW, 2)} />
            </>
          ))
        )
      )
    ),
  // a dead thorn tree in a stone pot, glowing ember berries
  cactus: () =>
    cat(
      cylE(16, 42, 7, 7, 0, 12, STONE_DK, 8, 8),
      bandAt(16, 42, 7.5, 8.5, '#4a4858', 1.2),
      ellH(16, 42, 12.1, 6.2, 6.2, '#3a2a1e', { sw: 1 }),
      bill(
        16,
        42,
        12,
        <>
          {limb('M0 0 V-30', 5.5, '#5a4636')}
          {limb('M0 -16 L-10 -26 L-11 -35', 3, '#5a4636')}
          {limb('M0 -24 L9 -32 L10 -42', 3, '#5a4636')}
          {limb('M0 -30 L-3 -44', 2.6, '#5a4636')}
          <path d="M-3 -10 l-3 -2 M3 -20 l3 -2 M-6 -22 l-3 -1 M5 -28 l3 -1 M-8 -30 l-3 1 M8 -38 l3 -1" stroke="#cfc4a8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {glowG(
            '#ff6a3c',
            <>
              <circle cx="-3" cy="-45" r="2.4" fill="#ff6a3c" stroke={INK} strokeWidth="1" />
              <circle cx="10" cy="-43" r="2.2" fill="#ff8a2a" stroke={INK} strokeWidth="1" />
            </>,
            3
          )}
        </>
      )
    ),
  // an oak barrel bristling with a spear, an axe and a sword
  'umbrella-stand': () =>
    cat(
      bill(
        16,
        42,
        24,
        <>
          {limb('M-4 0 V-32', 2, WOOD_LT)}
          <path d="M-4 -42 L-1.4 -32 L-4 -30 L-6.6 -32Z" fill="#d3dbe3" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          {limb('M5 0 V-28', 2, WOOD_LT)}
          <path d="M5 -34 Q13 -36 12 -26 Q9 -28 5 -27Z" fill="#b4bdc8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <rect x="-1.2" y="-14" width="2.4" height="14" fill="#5a3a1f" stroke={INK} strokeWidth="1" />
          <path d="M-5 -14 h10" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" />
          <circle cy="-17.4" r="2" fill={GOLD} stroke={INK} strokeWidth="1" />
        </>
      ),
      cylE(16, 42, 6, 6, 0, 12, WOOD, 7, 7),
      cylE(16, 42, 7, 7, 12, 24, WOOD, 6, 6),
      bandAt(16, 42, 6.6, 5),
      bandAt(16, 42, 7, 12),
      bandAt(16, 42, 6.4, 19)
    ),
  // a long-handled ash rake leaning on the wall and an iron shovel on the floor
  broom: () =>
    cat(
      isoLine([P(8, 40, 14), P(4, 44, 76)], 2.6, WOOD),
      isoLine([P(7.6, 40.3, 16), P(3.6, 44.3, 74)], 1, HI),
      bill(
        8,
        40,
        0.8,
        <>
          <path d="M-8 -13 h16 v3 h-16z" fill={IRON} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M-7 -10 v10 M-3.5 -10 v10 M0 -10 v10 M3.5 -10 v10 M7 -10 v10" stroke={IRON_LT} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
      box(19, 34, 10, 12, 0, 1.5, IRON),
      box(19, 34, 2, 12, 1.5, 5, IRON_LT),
      isoLine([P(27, 40, 1.5), P(25, 38.5, 28)], 2, WOOD),
      isoLine([P(20.5, 35, 1.4), P(27.5, 35, 1.4)], 1, HI)
    ),

  /* ---------- bedside nook (u 2-32, v 140-182, h 0-70) ---------- */
  // a wooden table with a caged lantern (animated flame, glowing)
  'side-table-lamp': () =>
    cat(
      box(4, 148, 26, 26, 0, 32, WOOD),
      box(3, 147, 28, 28, 32, 35, WOOD_LT),
      rectU(30, 152, 170, 12, 28, WOOD_DK),
      bill(30, 161, 20, <circle r="1.8" fill={GOLD} stroke={INK} strokeWidth="1.1" />),
      cyl(17, 161, 5, 35, 38, IRON),
      bill(17, 161, 42, <circle r="9" fill="#ffb347" opacity=".22" />),
      flame(17, 161, 38.5, 0.8, 0.2),
      ...[[13, 157], [21, 157], [13, 165], [21, 165]].map(([x, y]) => isoLine([P(x, y, 38), P(x, y, 54)], 1.6, IRON_LT)),
      cylE(17, 161, 6.5, 6.5, 54, 57, IRON, 6.5, 6.5),
      cylE(17, 161, 6.5, 6.5, 57, 62, IRON, 1.6, 1.6)
    ),
  // a table with a hide war drum and two bone sticks
  'record-player': () => {
    const t0 = nearRange(9, 9)[0]
    const rope = Array.from({ length: 11 }, (_, i) => P(17 + 9 * Math.cos(t0 + (i / 10) * Math.PI), 161 + 9 * Math.sin(t0 + (i / 10) * Math.PI), i % 2 ? 46.6 : 39.4))
    return cat(
      box(4, 148, 26, 26, 0, 34, '#6a4526'),
      rectU(30, 152, 170, 6, 28, '#4a3018'),
      ...[156, 161, 166].map((v) => ellU(30.1, v, 17, 1.6, 1.6, GOLD, { sw: 0.8 })),
      box(7, 151, 20, 20, 34, 36, '#4a3018'),
      cylE(17, 161, 9, 9, 36, 48, '#9a6b3a', 9, 9),
      ellH(17, 161, 48, 9, 9, BONE, { sw: 1.4 }),
      isoLine(rope, 1.2, '#e8dcc0'),
      isoLine([P(11, 155, 48.6), P(22, 160, 49)], 2.2, BONE),
      isoLine([P(13, 167, 48.6), P(22, 162, 49)], 2.2, BONE)
    )
  },
  // an iron stand cradling a speckled dragon egg on a crimson cushion
  'plant-stand': () =>
    cat(
      ...[[11, 155], [21, 155], [11, 165], [21, 165]].map(([u, v]) => box(u, v, 2, 2, 0, 36, IRON)),
      cyl(17, 161, 9.5, 36, 39, IRON_LT),
      cylE(17, 161, 6.5, 6.5, 39, 42, CLOAK, 7.5, 7.5),
      bill(
        17,
        161,
        42,
        <>
          <ellipse cy="-10" rx="8" ry="10.5" fill="#b5e0c9" stroke={INK} strokeWidth="1.4" />
          <circle cx="-2.4" cy="-13" r="1.8" fill="#6cc59a" />
          <circle cx="3" cy="-7.4" r="1.6" fill="#6cc59a" />
          <circle cx="1" cy="-16" r="1.2" fill="#6cc59a" />
          <path d="M-5 -16 q1.4 -2.6 4 -3" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      ),
      sparkle(21, 158, 56, 0.6)
    ),
  // a wooden stool with two stacked tomes and a candle (animated flame)
  'stool-books': () =>
    cat(
      ...[[9, 153], [25, 153], [9, 169], [25, 169]].map(([u, v]) => box(u, v, 2, 2, 0, 26, WOOD)),
      cyl(17, 161, 11, 26, 30, WOOD_DK),
      box(10, 155, 14, 10, 30, 34, TEAL),
      poly(rectUPoints(24.02, 156, 164, 30.8, 33.2), '#f4ead2', { stroke: null }),
      box(11, 156, 12, 9, 34, 37, CLOAK),
      poly(rectUPoints(23.02, 157, 164, 34.7, 36.3), '#f4ead2', { stroke: null }),
      rectU(23.05, 159, 162, 34.6, 36.4, GOLD, { stroke: null }),
      candle(17, 160, 37, 5, 0.45, 0.3)
    ),

  /* ---------- foot of the bed (u 96-126, v 196-240, h 0-30) ---------- */
  // an iron-banded treasure chest with a gold lock and coins on the lid
  'toy-chest': () =>
    cat(
      box(98, 200, 26, 38, 0, 22, WOOD),
      seamsU(124.05, [208, 215, 222, 229], 1, 21, WOOD_DK),
      rectU(124.05, 203, 209, 0, 22, IRON),
      rectU(124.05, 229, 235, 0, 22, IRON),
      box(97, 199, 28, 40, 22, 26, WOOD_DK),
      rectU(125.05, 203, 209, 22, 26, IRON),
      rectU(125.05, 229, 235, 22, 26, IRON),
      ellU(125.1, 219, 22, 3.2, 3.2, GOLD, { sw: 1.2 }),
      coinScatter(110, 219, 13, 18, 26.2, 8, 3, 0.85, 2)
    ),
  // a stone slab bench with a crimson cushion
  bench: () =>
    cat(
      ...[[99, 201], [118, 201], [99, 233], [118, 233]].map(([u, v]) => box(u, v, 4, 4, 0, 16, STONE_DK)),
      stoneBox(98, 200, 24, 36, 16, 21, STONE),
      box(99, 202, 22, 32, 21, 25, CLOAK),
      ...[[104, 208], [104, 218], [104, 228], [114, 208], [114, 218], [114, 228]].map(([u, v]) => ellH(u, v, 25.1, 1.1, 1.1, GOLD, { stroke: null })),
      isoLine([P(100, 202.8, 24.7), P(120, 202.8, 24.7)], 1, HI)
    ),
  // a woven basket heaped with coins and gems (animated glint)
  'laundry-basket': () =>
    cat(
      cylE(111, 218, 10, 10, 0, 20, '#b88a4a', 12, 12),
      bandAt(111, 218, 10.7, 6, '#7a5a2a', 1.2),
      bandAt(111, 218, 11.4, 13, '#7a5a2a', 1.2),
      ellH(111, 218, 20, 10.6, 10.6, '#3a2a1e', { sw: 1 }),
      coinScatter(111, 218, 9, 9, 20.3, 16, 4, 0.92, 2.2),
      gem(106, 214, 20.4, '#d63a4a'),
      gem(116, 222, 20.4, '#4aa8e8'),
      gem(113, 212, 20.4, '#5cc46a'),
      sparkle(110, 218, 24, 0.2)
    ),
  // a hide mat with a pair of claw boots
  slippers: () =>
    cat(
      box(98, 198, 26, 40, 0, 1.2, '#6a2a30'),
      rectH(1.3, 101, 121, 201, 235, 'none', { stroke: GOLD, sw: 1.2 }),
      ...[208, 224].map((v) =>
        cat(
          ellH(110, v, 1.5, 9, 4.2, '#2f6b5a'),
          cyl(114.5, v, 3.6, 1.5, 5, '#3fa57c'),
          ...[-2, 0, 2].map((d) => poly([P(101, v + d - 0.8, 1.6), P(97.6, v + d * 1.2, 1.6), P(101, v + d + 0.8, 1.6)], BONE, { sw: 0.8 }))
        )
      )
    )
}
