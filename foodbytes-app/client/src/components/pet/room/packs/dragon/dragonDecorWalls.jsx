import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { CLOAK, DRAGON_INK, GOLD, GOLD_DK, GOLD_HI, IRON, IRON_LT, STONE, WOOD, WOOD_DK, WOOD_LT } from './dragonPalette'
import { BONE, HI, TEAL, TEAL_HI, ellU, flask, runeRowV, slabU } from './dragonDecorParts'
import { flame, gem, S, sparkle } from './dragonParts'
import { helm } from './dragonTreasure'

/**
 * MPP-46: the lair's 14 wall decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, over the wardrobe, bedside wall and front
 * right wall). World coords; the 12 legacy ids are in MPP-27 coords and slid by packDecorArt.
 */
const { poly, isoLine, isoLines, box, rectV, rectU, cyl, bill, fxg } = S
const INK = DRAGON_INK

export const DRAGON_WALL_DECOR = {
  /* ---------- over the wardrobe (left wall; legacy ids drawn at u 150-186, h 128-176) ---------- */
  // a dragon scale mounted on a plaque
  'basil-print': () =>
    cat(
      rectV(0, 154, 182, 136, 166, WOOD_LT),
      rectV(0, 157, 179, 139, 163, '#2e3b3a'),
      bill(
        168,
        0,
        151,
        <>
          <path d="M0 -13 C9 -13 13 -4 0 12 C-13 -4 -9 -13 0 -13Z" fill={TEAL_HI} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M0 -10 V9 M-5 -6 Q0 -3 5 -6 M-6 -1 Q0 2 6 -1 M-4 4 Q0 6 4 4" stroke="#1f6b4c" strokeWidth="1" fill="none" />
          <path d="M-5 -8 q2 -3 5 -3" stroke="#bff0d8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )
    ),
  // a slate tablet with glowing runes
  'recipe-board': () => cat(rectV(0, 152, 184, 134, 168, WOOD), rectV(0, 155, 181, 137, 165, '#3a3c4a'), ...[156, 148, 140].map((h) => runeRowV(0, 158, h, 4))),
  // a stone shelf on two iron brackets with three potion flasks
  'herb-shelf': () =>
    cat(
      ...[154, 180].map((u) => box(u, 0, 3, 6, 128, 136, IRON)),
      box(150, 0, 36, 8, 136, 140, WOOD),
      ...[[156, '#6fd36a'], [168, '#b05ad8'], [180, '#e5534b']].map(([u, c]) => glowG(c, flask(u, 4, 140, c), 2))
    ),
  // a wire of five hanging crystals (animated glints, glowing)
  'fairy-lights': () => {
    const at = (i) => [150 + i * 6, 166 - Math.sin((i / 6) * Math.PI) * 10]
    const cols = ['#7de3ff', '#ff8fab', '#8fe08a', '#ffd34d', '#b58cff']
    return cat(
      isoLine(Array.from({ length: 7 }, (_, i) => P(at(i)[0], 0, at(i)[1])), 1.3, IRON),
      ...[1, 2, 3, 4, 5].map((i, k) =>
        bill(
          at(i)[0],
          0,
          at(i)[1],
          glowG(
            cols[k],
            fxg(
              'glint',
              <>
                <path d="M0 0 L3.2 4 L0 12 L-3.2 4Z" fill={cols[k]} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
                <path d="M-1 3 L0 1 L1 3" stroke="#fff" fill="none" strokeWidth=".8" />
              </>,
              k * 0.5
            ),
            3
          )
        )
      )
    )
  },
  // a gilt frame round a painted hatchling
  'pip-portrait': () =>
    cat(
      box(24, 0, 28, 2.4, 106, 138, GOLD_DK),
      rectV(2.55, 27, 49, 109, 135, '#27403f'),
      bill(
        38,
        2.7,
        121,
        <>
          <path d="M-6 -6 L-9.5 -14 L-2 -8Z M6 -6 L9.5 -14 L2 -8Z" fill={BONE} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse rx="9" ry="8.4" fill="#6cc59a" stroke={INK} strokeWidth="1.5" />
          <ellipse cy="4.2" rx="5" ry="3.2" fill="#a8e8cc" />
          <ellipse cx="-3.6" cy="-1.4" rx="2.2" ry="2.8" fill="#ffcf4d" stroke={INK} strokeWidth="1" />
          <ellipse cx="3.6" cy="-1.4" rx="2.2" ry="2.8" fill="#ffcf4d" stroke={INK} strokeWidth="1" />
          <path d="M-3.6 -3.6 v4.4 M3.6 -3.6 v4.4" stroke={INK} strokeWidth="1.2" />
          <circle cx="-1.4" cy="3.4" r=".7" fill={INK} />
          <circle cx="1.4" cy="3.4" r=".7" fill={INK} />
        </>
      ),
      isoLine([P(25.5, 2.45, 136.4), P(50.5, 2.45, 136.4)], 1, HI)
    ),

  /* ---------- bedside wall (right wall, v 134-154: tall and narrow) ---------- */
  // a wooden post notched with growth marks and a claw print
  'growth-chart': () =>
    cat(
      box(0, 137, 1.8, 12, 62, 122, WOOD_LT),
      isoLines([70, 80, 90, 100, 110].map((h, i) => [P(1.95, 138.4, h), P(1.95, i % 2 ? 141 : 143.2, h)]), 1.2, INK),
      rectU(1.95, 138, 148, 114, 119, '#b8402e', { stroke: null }),
      bill(
        1.95,
        146,
        90,
        <>
          <ellipse cy="1" rx="3.2" ry="2.6" fill={TEAL_HI} stroke={INK} strokeWidth="1.1" />
          <path d="M-4 -2 l-1 -4 M0 -3 v-5 M4 -2 l1 -4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
      isoLine([P(1.95, 137.6, 121), P(1.95, 137.6, 63)], 1, HI)
    ),
  // a stone slab scored with tally marks, a few picked out in gold
  'meal-calendar': () => {
    const marks = []
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        if ((r + c) % 2) continue
        const v = 138.6 + c * 4.6
        const h = 84 + r * 8
        marks.push([P(3.15, v, h + 1), P(3.15, v, h + 6)], [P(3.15, v + 1.8, h + 1), P(3.15, v + 1.8, h + 6)])
      }
    return cat(
      box(0, 136, 3, 16, 76, 114, STONE),
      rectU(3.05, 138, 150, 82, 108, '#7d7a88', { stroke: null }),
      isoLines([[P(3.1, 142.5, 82), P(3.1, 142.5, 108)], [P(3.1, 147, 82), P(3.1, 147, 108)], [P(3.1, 138, 90), P(3.1, 150, 90)], [P(3.1, 138, 98), P(3.1, 150, 98)]], 1, '#55525f'),
      isoLines(marks, 1.5, GOLD_HI),
      ellU(3.05, 144, 111, 1.6, 1.6, GOLD, { sw: 1 })
    )
  },
  // an iron-bracketed wall torch (animated flame, glowing)
  'wall-sconce': () =>
    cat(
      rectU(0, 140.5, 147.5, 84, 98, IRON),
      box(0, 142.5, 5, 3, 88, 91, IRON),
      cyl(4.8, 144, 3.4, 90, 98, IRON),
      bill(4.8, 144, 98, <ellipse cy="2" rx="3.6" ry="2.2" fill="#6b4a2a" stroke={INK} strokeWidth="1.1" />),
      flame(4.8, 144, 99, 0.9, 0.4)
    ),
  // three framed gems, each with a twinkle (animated glints)
  'photo-strip': () =>
    cat(
      ...[[64, '#d63a4a'], [82, '#4aa8e8'], [100, '#5cc46a']].map(([h, c], i) =>
        cat(
          box(0, 137, 1.6, 14, h, h + 14, WOOD_DK),
          rectU(1.75, 139, 149, h + 2, h + 12, '#241f2b', { stroke: null }),
          gem(1.8, 144, h + 8, c),
          sparkle(1.95, 147.5, h + 11, i * 0.9)
        )
      )
    ),

  /* ---------- front right wall (right wall; legacy ids drawn at v 34-80, h 138-178) ---------- */
  // a wall hourglass: a wooden frame round two glass bulbs and a stream of sand
  'wall-clock': () =>
    bill(
      0,
      57,
      158,
      <>
        <path d="M-9 -17 V17 M9 -17 V17" stroke={WOOD} strokeWidth="3" strokeLinecap="round" />
        <path d="M-7 -15 H7 C7 -7 1.4 -3 1.4 0 C1.4 3 7 7 7 15 H-7 C-7 7 -1.4 3 -1.4 0 C-1.4 -3 -7 -7 -7 -15Z" fill="#d7f0ff" fillOpacity=".7" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M-4.6 -13 H4.6 C3.8 -8 1 -5 0 -2Z" fill="#e8b838" />
        <path d="M0 -1 V8" stroke="#e8b838" strokeWidth="1" />
        <path d="M-6 14 C-5 9 -2 7 0 6 C2 7 5 9 6 14Z" fill="#e8b838" />
        <rect x="-10.5" y="-19" width="21" height="4" rx="1.5" fill={WOOD} stroke={INK} strokeWidth="1.4" />
        <rect x="-10.5" y="15" width="21" height="4" rx="1.5" fill={WOOD} stroke={INK} strokeWidth="1.4" />
      </>
    ),
  // a string of swallow-tail pennants (each sways)
  bunting: () =>
    cat(
      isoLine([P(0, 34, 172), P(0, 80, 172)], 1.4, IRON),
      ...[CLOAK, GOLD, TEAL, CLOAK, GOLD].map((c, i) => {
        const v = 36 + i * 9
        return fxg('sway', poly([P(0, v, 171), P(0, v + 8, 171), P(0, v + 8, 159), P(0, v + 4, 163.5), P(0, v, 159)], c, { sw: 1.2 }), i * 0.6)
      })
    ),
  // an iron rail with three small cauldrons
  'pan-rail': () =>
    cat(
      isoLine([P(0, 36, 170), P(0, 78, 170)], 2.6, IRON),
      ...[44, 57, 70].map((v, i) =>
        bill(
          0,
          v,
          170,
          <>
            <path d="M0 0 V5" stroke={INK} strokeWidth="1.4" />
            <g transform={`translate(0 4) scale(${1 + i * 0.12})`}>
              <path d="M-7 2 Q-8 14 0 15 Q8 14 7 2Z" fill="#3c434c" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
              <ellipse cy="2" rx="7" ry="2.2" fill="#6b7480" stroke={INK} strokeWidth="1.2" />
              <path d="M-5 5 q1 5 3 7" stroke="#fff" strokeOpacity=".5" fill="none" strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </>
        )
      )
    ),
  // a polished round buckler: steel face, crimson cross, gold boss
  mirror: () =>
    bill(
      0,
      57,
      158,
      <>
        <circle r="16" fill="#8f98a3" stroke={INK} strokeWidth="2.2" />
        <circle r="12.4" fill="#d3dbe3" stroke="#5d6670" strokeWidth="1.2" />
        <path d="M0 -12 V12 M-12 0 H12" stroke={CLOAK} strokeWidth="2.4" />
        <circle r="4.6" fill={GOLD} stroke={INK} strokeWidth="1.4" />
        <path d="M-7 -7 l5 -4" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={(14.2 * Math.cos((i / 6) * Math.PI * 2)).toFixed(1)} cy={(14.2 * Math.sin((i / 6) * Math.PI * 2)).toFixed(1)} r="1" fill={IRON_LT} />
        ))}
      </>
    ),
  // a plank with pegs: a crimson cloak, a horned helm and a teal pouch hang from it
  'coat-hooks': () =>
    cat(
      box(0, 252, 2, 42, 121, 128, WOOD_LT),
      isoLine([P(2.1, 253, 127), P(2.1, 293, 127)], 1, HI),
      ...[260, 273, 286].map((v) => box(2, v - 0.8, 2, 1.6, 124, 126.5, IRON)),
      slabU(2, 0.9, [[256, 124], [266, 124], [268, 99], [254, 99]], CLOAK),
      ellU(2.95, 261, 120, 1.6, 1.6, GOLD, { sw: 1 }),
      isoLines([[P(2.95, 258, 122), P(2.95, 257, 100)], [P(2.95, 262, 122), P(2.95, 262, 100)]], 1.1, '#5a1c25', 0.8),
      isoLine([P(3, 273, 119), P(3, 273, 124)], 1.2, INK),
      helm(3.4, 273, 103, 0.75),
      slabU(2, 0.9, [[281, 113], [291, 113], [292, 100], [280, 100]], TEAL),
      isoLine([P(2.95, 283, 113), P(2.95, 285, 124), P(2.95, 287, 124), P(2.95, 289, 113)], 1.4, INK)
    )
}
