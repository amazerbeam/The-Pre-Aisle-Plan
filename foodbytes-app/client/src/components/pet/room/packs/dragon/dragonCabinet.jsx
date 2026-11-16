import { cat } from '../packShapes'
import { DRAGON_INK, GOLD, GOLD_DK, GOLD_HI, IRON, STONE, STONE_DK, STONE_LT, WOOD, WOOD_DK } from './dragonPalette'
import { S, coinScatter, gem, mound, seamsU, sparkle, stoneBox } from './dragonParts'
import { crown, ribbon, trophy } from './dragonTreasure'

/**
 * MPP-45: the dragon lair's hoard (the trophy cabinet), four levels (pip-room-dragon.html DRAGON_ROOM.stations.cabinet). Trophies
 * and ribbons sit where the live cabinet shows them. Against the right wall (u = 0), running along v.
 */
const { box, rectU, cylE, bill } = S

export const DRAGON_CABINET = [
  // L1: a small hoard chest, lid open against the wall, gold heaped inside with a trophy and a ribbon
  () =>
    cat(
      box(0, 30, 22, 70, 0, 26, WOOD),
      seamsU(22, [44, 52, 60, 68, 76, 84, 92], 1, 25, WOOD_DK),
      rectU(22, 36, 42, 0, 26, IRON),
      rectU(22, 88, 94, 0, 26, IRON),
      rectU(22, 60, 70, 10, 20, GOLD_DK),
      bill(
        22,
        65,
        15,
        <>
          <circle r="1.6" fill={DRAGON_INK} />
          <rect x="-.6" y="0" width="1.2" height="3" fill={DRAGON_INK} />
        </>
      ),
      box(0, 28, 3, 74, 26, 48, WOOD_DK),
      rectU(3, 36, 42, 28, 46, IRON),
      rectU(3, 88, 94, 28, 46, IRON),
      cylE(11, 65, 9, 31, 26, 30, GOLD, 8, 29),
      cylE(11, 65, 8, 29, 30, 33, GOLD_HI, 6, 25),
      coinScatter(11, 65, 6, 23, 33.2, 12, 7, 0.9, 2.2),
      trophy(11, 48, 31, 0.55),
      trophy(11, 65, 33, 0.65),
      ribbon(11, 82, 31, 0.5),
      sparkle(14, 58, 35, 0.4),
      sparkle(12, 75, 36, 1.5)
    ),
  // L2: a hoard chest on a stone shelf, a second shelf of trophies above (the shelves float on the wall from h 30)
  () =>
    cat(
      box(0, 38, 14, 3, 30, 40, STONE_DK),
      box(0, 92, 14, 3, 30, 40, STONE_DK),
      stoneBox(0, 30, 22, 72, 40, 46, STONE),
      box(2, 38, 16, 56, 46, 60, WOOD),
      seamsU(18, [46, 54, 62, 70, 78, 86], 47, 59, WOOD_DK),
      rectU(18, 44, 49, 46, 60, IRON),
      rectU(18, 83, 88, 46, 60, IRON),
      rectU(18, 62, 70, 50, 58, GOLD_DK),
      box(2, 38, 16, 56, 60, 66, WOOD_DK),
      cylE(10, 66, 7, 22, 66, 69, GOLD, 6, 19),
      coinScatter(10, 66, 5, 17, 69.2, 8, 3, 0.9, 2),
      gem(18, 50, 66, '#d63a4a'),
      gem(18, 82, 66, '#4aa8e8'),
      box(0, 38, 14, 3, 68, 78, STONE_DK),
      box(0, 92, 14, 3, 68, 78, STONE_DK),
      stoneBox(0, 30, 22, 72, 78, 84, STONE),
      trophy(14, 46, 84, 0.55),
      ribbon(12, 66, 84, 0.5),
      trophy(12, 84, 84, 0.6),
      sparkle(12, 60, 70, 0.7),
      sparkle(12, 90, 88, 1.6)
    ),
  // L3: a hoard chest below, a recessed stone niche above with trophies on two ledges
  () =>
    cat(
      box(0, 32, 24, 62, 0, 28, WOOD),
      seamsU(24, [40, 48, 56, 64, 72, 80, 88], 1, 27, WOOD_DK),
      rectU(24, 38, 44, 0, 28, IRON),
      rectU(24, 82, 88, 0, 28, IRON),
      rectU(24, 58, 68, 10, 22, GOLD_DK),
      box(0, 32, 24, 62, 28, 34, WOOD_DK),
      cylE(12, 63, 10, 29, 34, 36, GOLD, 8.5, 27),
      coinScatter(12, 63, 7, 24, 36.2, 9, 5, 0.9, 2.2),
      stoneBox(0, 30, 10, 66, 36, 112, STONE),
      rectU(10, 38, 88, 46, 104, '#3b3340'),
      rectU(10, 40, 86, 48, 102, '#4a3d3c', { stroke: null }),
      box(10, 40, 4, 46, 46, 49, STONE_LT),
      box(10, 40, 4, 46, 74, 77, STONE_LT),
      box(0, 30, 12, 66, 104, 112, STONE_LT),
      trophy(12, 52, 77, 0.55),
      trophy(12, 64, 77, 0.65),
      ribbon(12, 78, 77, 0.5),
      crown(12, 52, 49, 0.5),
      gem(12, 66, 49, '#5cc46a'),
      trophy(12, 78, 49, 0.5),
      sparkle(12, 58, 60, 0.3),
      sparkle(12, 74, 90, 1.4)
    ),
  // L4: a treasure alcove: stone columns and lintel, a gold heap at its foot and trophies on stone shelves
  () =>
    cat(
      stoneBox(0, 26, 30, 10, 0, 122, STONE),
      rectU(24, 36, 90, 8, 122, '#3b3340'),
      rectU(24, 40, 86, 12, 118, '#4a3d3c', { stroke: null }),
      box(8, 36, 20, 54, 44, 48, STONE_LT),
      box(8, 36, 20, 54, 84, 88, STONE_LT),
      box(8, 36, 20, 54, 4, 8, STONE_LT),
      trophy(22, 48, 88, 0.6),
      crown(22, 63, 88, 0.62),
      trophy(22, 78, 88, 0.6),
      ribbon(22, 46, 48, 0.5),
      trophy(22, 63, 48, 0.6),
      gem(22, 74, 48, '#d63a4a'),
      gem(22, 82, 48, '#4aa8e8'),
      mound(16, 63, 13, 24, 9, 3, '#d4a42a', 0.7),
      coinScatter(16, 63, 11, 21, 4, 8, 13, 0.9, 2),
      gem(24, 52, 9, '#d63a4a'),
      gem(24, 74, 9, '#5cc46a'),
      stoneBox(0, 90, 30, 10, 0, 122, STONE),
      stoneBox(0, 26, 30, 74, 122, 134, STONE_LT),
      gem(30, 63, 129, '#d63a4a'),
      sparkle(24, 44, 56, 0.2),
      sparkle(24, 82, 96, 1.2),
      sparkle(24, 63, 20, 2.1),
      sparkle(24, 70, 66, 0.8)
    )
]
