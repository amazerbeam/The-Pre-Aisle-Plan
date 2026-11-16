import { P } from '../../iso'
import { cat } from '../packShapes'
import { DRAGON_INK, EMBER, FIRE, GOLD_DK, IRON, IRON_LT, STONE, STONE_DK, STONE_LT, WOOD, WOOD_DK, WOOD_LT } from './dragonPalette'
import { S, archV, brickU, brickV, embers, flame, rivetsV, stoneBox } from './dragonParts'

/**
 * MPP-45: the dragon lair's forge hearth, four levels (pip-room-dragon.html DRAGON_ROOM.stations.cooker). Steam rises from the
 * cauldron at STATION_ANCHORS.cookerPot and the plate lands at cookerPlate, both drawn by the pack's effects. The hearth fire and
 * embers keep their room-fx classes and delays.
 */
const { poly, isoLines, box, rectV, cylE, ellH, bill } = S

export const DRAGON_COOKER = [
  // L1: a campfire ring with a pot on a tripod
  () => {
    const rocks = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2
      return [118 + 11.5 * Math.cos(a), 15 + 11.5 * Math.sin(a), i]
    }).sort((x, y) => x[0] + x[1] - (y[0] + y[1]))
    const ring = rocks.map(([u, v, i]) => box(u - 2.5, v - 2.5, 5, 5, 0, 4.5 + (i % 3), i % 2 ? STONE : STONE_DK))
    const legs = [[108, 5], [128, 6], [118, 25]]
    const poles = legs.map(([u, v]) => isoLines([[P(u, v, 5), P(118, 15, 44)]], 2.8, WOOD_DK))
    // The mockup split the ring's concatenated string at half its length; here the near-pot rocks are the back half by depth order.
    const half = Math.floor(ring.length / 2)
    return cat(
      ellH(118, 15, 3, 13, 13, '#2a1f1c', { sw: 1.2 }),
      poles[0],
      poles[1],
      ...ring.slice(0, half),
      ellH(118, 15, 4.4, 8.6, 8.6, EMBER, { sw: 1 }),
      box(109, 13, 17, 3, 4.5, 8, WOOD_DK),
      box(116, 7, 3, 17, 7.5, 11, WOOD),
      flame(118, 15, 11, 1.15, 0.3),
      flame(112, 17, 8, 0.85, 1.1),
      flame(124, 13, 8, 0.85, 0.7),
      isoLines([[P(113, 15, 34), P(118, 15, 44)], [P(123, 15, 34), P(118, 15, 44)]], 1.3, IRON),
      cylE(118, 15, 6, 6, 17, 24, IRON, 9, 9),
      cylE(118, 15, 9, 9, 24, 33, IRON, 9.8, 9.8),
      cylE(118, 15, 10.4, 10.4, 33, 35, IRON_LT),
      ellH(118, 15, 35, 8.4, 8.4, '#6fae5a', { sw: 1 }),
      poles[2],
      ...ring.slice(half),
      embers(118, 28, 12, 3)
    )
  },
  // L2: a stone hearth with a glowing firebox, firewood and a cauldron
  () =>
    cat(
      stoneBox(60, 0, 80, 36, 0, 50, STONE_DK),
      box(58, 0, 84, 38, 50, 55, STONE_LT),
      stoneBox(112, 1, 22, 10, 55, 70, STONE),
      archV(36, 100, 20, 6, 28, 14, STONE_LT),
      archV(36, 100, 17, 6, 26, 12, '#1d1618'),
      archV(36, 100, 13, 8, 26, 9, '#7a2a14'),
      archV(36, 100, 8, 8, 24, 6, FIRE, { stroke: null }),
      flame(93, 36, 9, 0.95, 0.2),
      flame(100, 36, 9, 1.2, 0.7),
      flame(107, 36, 9, 0.95, 1.2),
      embers(100, 37, 42, 4),
      box(120, 22, 18, 6, 55, 61, WOOD),
      box(120, 28, 18, 6, 55, 61, WOOD_DK),
      box(122, 24, 14, 6, 61, 66, WOOD_LT),
      ...[[73, 14], [87, 14], [80, 25]].map(([u, v]) => box(u - 1.5, v - 1.5, 3, 3, 55, 59, IRON)),
      cylE(80, 19, 9, 9, 58, 64, IRON, 11.5, 11.5),
      cylE(80, 19, 11.5, 11.5, 64, 68.5, IRON, 10.5, 10.5),
      cylE(80, 19, 11.6, 11.6, 68.5, 70, IRON_LT),
      ellH(80, 19, 70, 9.8, 9.8, '#6fb35a', { sw: 1 })
    ),
  // L3: a forge hearth with a hooded flue, a cauldron on top, an anvil and a leather bellows
  () => {
    const folds = [18, 25, 32, 39].map((h) => [P(110.5, 36, h), P(131.5, 36, h)])
    return cat(
      box(78, 0, 18, 12, 62, 76, STONE),
      box(76, 0, 22, 14, 76, 80, STONE_LT),
      stoneBox(72, 0, 66, 36, 0, 58, STONE_DK),
      box(70, 0, 70, 38, 58, 62, '#5d5a68'),
      archV(36, 90, 17, 6, 30, 12, STONE_LT),
      archV(36, 90, 14, 6, 28, 10, '#1d1618'),
      archV(36, 90, 10, 8, 28, 7, '#7a2a14'),
      archV(36, 90, 6, 8, 25, 5, FIRE, { stroke: null }),
      flame(84, 36, 9, 1, 0.3),
      flame(91, 36, 9, 1.25, 0.9),
      flame(98, 36, 9, 1, 1.4),
      embers(91, 37, 44, 4),
      poly([P(110, 36, 10), P(132, 36, 10), P(128, 36, 43), P(114, 36, 43)], '#7a4a2a'),
      isoLines(folds, 1.1, '#4a2c18'),
      rectV(36, 108, 134, 8, 12, WOOD),
      rectV(36, 112, 130, 43, 47, WOOD),
      isoLines([[P(110, 36, 22), P(104, 36, 22)]], 3, IRON),
      isoLines([[P(126, 36, 46), P(127, 36, 56)]], 3, WOOD_LT),
      box(122, 6, 14, 8, 62, 64, IRON),
      box(124, 8, 10, 4, 64, 68, IRON_LT),
      ...[[83, 13], [101, 13], [92, 27]].map(([u, v]) => box(u - 1.5, v - 1.5, 3, 3, 62, 65, IRON)),
      cylE(92, 20, 10, 10, 64, 69, IRON, 12.5, 12.5),
      cylE(92, 20, 12.5, 12.5, 69, 78.6, IRON, 11, 11),
      cylE(92, 20, 12.6, 12.6, 78.6, 80, IRON_LT),
      ellH(92, 20, 80, 10.8, 10.8, '#6fb35a', { sw: 1 })
    )
  },
  // L4: a great forge: arched firebox, oven door, a hood over the cauldron, a tall stone chimney, an anvil
  () => {
    const vents = [112, 118, 124].map((u) => rectV(38, u - 1, u + 1, 20, 26, '#14181c', { stroke: null }))
    const posts = [62, 120].map((u) => isoLines([[P(u, 2, 63), P(u, 2, 94)]], 3, IRON))
    return cat(
      stoneBox(50, 0, 90, 38, 0, 58, '#5d5a68'),
      rectV(38, 50, 140, 54, 58, GOLD_DK),
      box(48, 0, 94, 40, 58, 63, STONE_LT),
      archV(38, 72, 19, 6, 34, 14, STONE_LT),
      archV(38, 72, 16, 6, 32, 12, '#1d1618'),
      archV(38, 72, 12, 8, 32, 9, '#7a2a14'),
      archV(38, 72, 7, 8, 28, 6, FIRE, { stroke: null }),
      flame(64, 38, 9, 1.05, 0.2),
      flame(72, 38, 9, 1.35, 0.8),
      flame(80, 38, 9, 1.05, 1.5),
      embers(72, 39, 46, 5),
      archV(38, 118, 15, 6, 30, 10, IRON),
      archV(38, 118, 12, 8, 30, 8, '#3c434c'),
      ...vents,
      bill(125, 38, 26, <circle r="2.4" fill={GOLD_DK} stroke={DRAGON_INK} strokeWidth="1" />),
      rivetsV(38, [105, 111, 125, 131], 9, IRON_LT),
      box(126, 10, 12, 8, 63, 67, IRON),
      box(128, 12, 8, 4, 67, 71, IRON_LT),
      box(86, 0, 12, 8, 118, 146, STONE_LT),
      brickV(8, 86, 98, 118, 146, '#6a6875'),
      brickU(98, 0, 8, 118, 146, '#6a6875'),
      box(84, 0, 16, 10, 146, 150, STONE_DK),
      box(72, 0, 38, 12, 102, 118, STONE),
      brickV(12, 72, 110, 102, 118, '#555266'),
      box(60, 0, 62, 18, 94, 102, '#6a6875'),
      brickV(18, 60, 122, 94, 102, '#4d4a5c'),
      ...posts,
      ...[[77, 13], [103, 13], [90, 29]].map(([u, v]) => box(u - 1.5, v - 1.5, 3, 3, 63, 66, IRON)),
      cylE(90, 20, 10, 10, 65, 70, IRON, 13, 13),
      cylE(90, 20, 13, 13, 70, 80.5, IRON, 11.5, 11.5),
      cylE(90, 20, 13.1, 13.1, 80.5, 82, IRON_LT),
      ellH(90, 20, 82, 11.2, 11.2, '#6fb35a', { sw: 1 })
    )
  }
]
