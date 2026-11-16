import { P } from '../../iso'
import { cat } from '../packShapes'
import { DRAGON_INK, GOLD_DK, ICE, ICE_HI, IRON, IRON_LT, WOOD, WOOD_DK } from './dragonPalette'
import { S, archV, brickU, brickV, crystal, discV, icicles, rivetsV, seamsU, seamsV, stoneBox } from './dragonParts'

/**
 * MPP-45: the dragon lair's ice chest, four levels (pip-room-dragon.html DRAGON_ROOM.stations.fridge). The frost gauge reads at
 * STATION_ANCHORS.fridgeTop (the top centre of each level), drawn by the pack's FridgeGauge.
 */
const { poly, isoLines, box, rectV, rectU, rectH, bill } = S

/** A keyhole latch: a ring and a slot, as a billboard. */
const latch = (u, v, h, r, w, len) =>
  bill(
    u,
    v,
    h,
    <>
      <circle r={r} fill={DRAGON_INK} />
      <rect x={-w / 2} y="0" width={w} height={len} fill={DRAGON_INK} />
    </>
  )

export const DRAGON_FRIDGE = [
  // L1: a small ice chest, iron-strapped, frost crystals on the lid
  () =>
    cat(
      box(146, 0, 40, 28, 0, 24, WOOD),
      seamsV(28, [153, 160, 167, 174, 181], 1, 23, WOOD_DK),
      seamsU(186, [7, 14, 21], 1, 23, WOOD_DK),
      rectV(28, 149, 155, 0, 24, IRON),
      rectV(28, 177, 183, 0, 24, IRON),
      rectU(186, 3, 9, 0, 24, IRON),
      rectU(186, 19, 25, 0, 24, IRON),
      rectV(28, 162, 170, 13, 21, IRON_LT),
      latch(166, 28, 16, 1.6, 1.2, 3.2),
      box(145, -1, 42, 30, 24, 31, WOOD_DK),
      rectH(31, 147, 185, 1, 27, ICE_HI, { stroke: null }),
      icicles(28, [150, 158, 169, 178, 184], 24, 5),
      crystal(154, 7, 5, 5, 31, 32, ICE),
      crystal(163, 11, 5, 5, 31, 32.5, ICE_HI),
      crystal(172, 6, 5, 6, 31, 32, ICE)
    ),
  // L2: an iron-bound locker with a frost cap and a crown of ice
  () =>
    cat(
      box(146, 0, 40, 34, 0, 44, '#6a5240'),
      seamsV(34, [153, 160, 167, 174, 181], 1, 43, WOOD_DK),
      seamsU(186, [8, 17, 26], 1, 43, WOOD_DK),
      rectV(34, 146, 186, 8, 13, IRON),
      rectV(34, 146, 186, 30, 35, IRON),
      rectU(186, 0, 34, 8, 13, IRON),
      rectU(186, 0, 34, 30, 35, IRON),
      rivetsV(34, [150, 158, 166, 174, 182], 10.5),
      rivetsV(34, [150, 158, 166, 174, 182], 32.5),
      rectV(34, 161, 173, 16, 28, IRON_LT),
      latch(167, 34, 22, 2, 1.4, 4),
      box(146, 0, 40, 34, 44, 48, ICE_HI),
      icicles(34, [150, 156, 163, 171, 178, 184], 44, 6),
      crystal(152, 6, 7, 7, 48, 52, ICE),
      crystal(176, 8, 6, 7, 48, 51, ICE_HI),
      crystal(160, 20, 6, 6, 48, 52, ICE_HI),
      crystal(166, 12, 7, 7, 48, 54, ICE)
    ),
  // L3: a cold-cellar door in the rock: arched plank door, iron bands, frost and icicles
  () => {
    const doorTop = (u) => 50 + 14 * Math.sqrt(Math.max(0, 1 - ((u - 163) / 14) ** 2))
    const seams = [154.8, 159.4, 163, 166.6, 171.2].map((u) => [P(u, 38, 6), P(u, 38, doorTop(u) - 1)])
    return cat(
      box(140, 0, 46, 38, 0, 76, '#6f6c80'),
      brickU(186, 0, 38, 0, 76, '#4d4a5c'),
      brickV(38, 140, 186, 0, 76, '#4d4a5c'),
      box(144, 0, 38, 34, 76, 98, '#7b788c'),
      brickV(34, 144, 182, 76, 98, '#555266'),
      box(150, 0, 26, 28, 98, 112, '#868399'),
      rectH(112, 150, 176, 0, 28, ICE_HI, { stroke: null }),
      archV(38, 163, 17, 4, 52, 18, '#a6a3b2'),
      archV(38, 163, 14, 6, 50, 14, WOOD),
      isoLines(seams, 0.9, WOOD_DK, 0.9),
      rectV(38, 149, 177, 16, 21, IRON),
      rectV(38, 149, 177, 38, 43, IRON),
      rivetsV(38, [152, 160, 168, 175], 18.5),
      rivetsV(38, [152, 160, 168, 175], 40.5),
      bill(
        171,
        38,
        30,
        <>
          <circle r="3.4" fill="none" stroke={IRON_LT} strokeWidth="1.8" />
          <circle r="3.4" fill="none" stroke={DRAGON_INK} strokeWidth=".8" />
        </>
      ),
      icicles(38, [148, 153, 158, 163, 168, 173, 178], 66, 8),
      icicles(34, [150, 160, 172, 180], 98, 7),
      poly([P(140, 38, 76), P(186, 38, 76), P(186, 38, 80), P(140, 38, 80)], ICE_HI, { sw: 1, op: 0.85 })
    )
  },
  // L4: a frost vault: blue stone, a round iron door with a locking wheel, icicles and a crown of ice
  () => {
    const spokes = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2
      return [P(156, 40, 50), P(156 + 17 * Math.cos(a), 40, 50 + 17 * Math.sin(a))]
    })
    const bolts = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      return bill(156 + 24 * Math.cos(a), 40, 50 + 24 * Math.sin(a), <circle r="1.4" fill={IRON_LT} stroke={DRAGON_INK} strokeWidth=".7" />)
    })
    return cat(
      stoneBox(124, 0, 64, 40, 0, 100, '#6f86a3'),
      box(124, 0, 64, 40, 100, 108, ICE_HI),
      icicles(40, [128, 135, 142, 149, 163, 170, 177, 184], 100, 9),
      discV(40, 156, 50, 26.5, 26.5, IRON, { sw: 2 }),
      discV(40, 156, 50, 21, 21, IRON_LT),
      discV(40, 156, 50, 16, 16, '#3c434c', { sw: 1.2 }),
      isoLines(spokes, 2.2, IRON_LT),
      discV(40, 156, 50, 4.6, 4.6, GOLD_DK, { sw: 1.4 }),
      ...bolts,
      rectV(40, 180, 184, 36, 46, IRON),
      rectV(40, 128, 132, 36, 46, IRON),
      isoLines([[P(142, 40, 66), P(150, 40, 74)], [P(166, 40, 28), P(172, 40, 33)]], 1.6, ICE_HI, 0.9),
      crystal(136, 8, 8, 8, 108, 114, ICE),
      crystal(170, 10, 8, 8, 108, 113, ICE_HI),
      crystal(152, 16, 8, 8, 108, 117, ICE_HI),
      crystal(146, 26, 6, 6, 108, 111, ICE)
    )
  }
]
