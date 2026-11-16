import { P } from '../../iso'
import { cat } from '../packShapes'
import { CLOAK, DRAGON_INK, GOLD, GOLD_DK, IRON, STONE, STONE_DK, STONE_LT, WOOD, WOOD_DK } from './dragonPalette'
import { S, archV, discV, seamsV, stoneBox } from './dragonParts'
import { armour, helm } from './dragonTreasure'

/**
 * MPP-45: the dragon lair's armour rack (Dress Pip), four levels (pip-room-dragon.html DRAGON_ROOM.stations.wardrobe). World coords,
 * no shift, along the left wall (v = 0). Tapping it opens the wardrobe, so each level shows clothes and armour to wear.
 */
const { poly, isoLines, box, bill } = S

/** A gold boss billboard (a shield or cloak stud). */
const boss = (u, v, h, r, sw) => bill(u, v, h, <circle r={r} fill={GOLD} stroke={DRAGON_INK} strokeWidth={sw} />)

export const DRAGON_WARDROBE = [
  // L1: a wooden peg frame with two cloaks, a satchel and a pair of boots
  () => {
    const cloakA = poly([P(16, 9.5, 76), P(40, 9.5, 76), P(44, 9.5, 42), P(12, 9.5, 42)], CLOAK)
    const cloakB = poly([P(44, 9.5, 76), P(58, 9.5, 76), P(61, 9.5, 52), P(42, 9.5, 52)], '#2f6b5a')
    const folds = cat(
      isoLines([[P(22, 9.5, 74), P(21, 9.5, 44)], [P(28, 9.5, 74), P(28, 9.5, 43)], [P(34, 9.5, 74), P(35, 9.5, 43)]], 1.1, '#5a1c25', 0.8),
      isoLines([[P(49, 9.5, 74), P(48, 9.5, 54)], [P(54, 9.5, 74), P(55, 9.5, 54)]], 1.1, '#1f4a3d', 0.8)
    )
    return cat(
      box(6, 4, 11, 11, 0, 3, WOOD_DK),
      box(10, 8, 3, 3, 3, 82, WOOD),
      box(58, 4, 11, 11, 0, 3, WOOD_DK),
      box(62, 8, 3, 3, 3, 82, WOOD),
      isoLines([[P(11.5, 9.5, 80), P(63.5, 9.5, 80)]], 3.2, WOOD_DK),
      isoLines([[P(20, 9.5, 80), P(20, 9.5, 77)], [P(32, 9.5, 80), P(32, 9.5, 77)], [P(50, 9.5, 80), P(50, 9.5, 77)]], 1.6, IRON),
      cloakA,
      cloakB,
      folds,
      boss(28, 9.5, 74, 3, 1.2),
      box(30, 16, 14, 10, 0, 7, '#9a6b3a'),
      poly([P(30, 26, 7), P(44, 26, 7), P(44, 26, 3), P(30, 26, 3)], '#7a4f28', { sw: 1.2 }),
      bill(37, 26, 5, <rect x="-2" y="-2" width="4" height="4" rx="1" fill={GOLD} stroke={DRAGON_INK} strokeWidth="1" />),
      box(18, 18, 5, 7, 0, 7, '#5a3a1f'),
      box(24, 18, 5, 7, 0, 7, '#5a3a1f'),
      box(18, 20, 5, 5, 7, 11, '#6e4a28'),
      box(24, 20, 5, 5, 7, 11, '#6e4a28')
    )
  },
  // L2: an armour stand: a wooden mannequin in a steel breastplate and a horned helm, a round shield and a sword leaning
  () =>
    cat(
      box(30, 6, 16, 14, 0, 4, WOOD_DK),
      box(36, 11, 4, 4, 4, 38, WOOD),
      discV(20, 20, 14, 9, 9, '#6a4526', { sw: 1.8 }),
      discV(20, 20, 14, 6.2, 6.2, CLOAK, { sw: 1.2 }),
      boss(20, 20, 14, 2.4, 1),
      isoLines([[P(52, 18, 3), P(50, 11, 52)]], 3, '#b4bdc8'),
      isoLines([[P(47, 14, 20), P(53, 16, 20)]], 2.4, GOLD_DK),
      armour(38, 13, 4, false, false, 0.8)
    ),
  // L3: an armour rack: back board, two shelves, helms, a mail shirt, crossed swords, a spear and a round shield
  () =>
    cat(
      box(6, 0, 60, 5, 2, 88, WOOD_DK),
      seamsV(5, [16, 26, 36, 46, 56], 3, 87, '#3f2814'),
      box(6, 0, 4, 30, 0, 92, WOOD),
      box(62, 0, 4, 30, 0, 92, WOOD),
      box(10, 5, 52, 9, 28, 31, '#b07a45'),
      box(10, 5, 52, 9, 58, 61, '#b07a45'),
      poly([P(30, 5.5, 56), P(46, 5.5, 56), P(44, 5.5, 34), P(32, 5.5, 34)], '#8f98a3'),
      seamsV(5.5, [34, 38, 42], 35, 55, '#5d6670', 0.8, 0.8),
      isoLines([[P(32, 5.5, 50), P(44, 5.5, 50)], [P(33, 5.5, 44), P(43, 5.5, 44)], [P(34, 5.5, 38), P(42, 5.5, 38)]], 0.9, '#5d6670', 0.8),
      isoLines([[P(14, 5.5, 64), P(26, 5.5, 86)], [P(26, 5.5, 64), P(14, 5.5, 86)]], 2.6, '#b4bdc8'),
      isoLines([[P(12, 5.5, 70), P(18, 5.5, 70)], [P(22, 5.5, 70), P(28, 5.5, 70)]], 2.4, GOLD_DK),
      isoLines([[P(56, 12, 0), P(58, 12, 84)]], 2.4, WOOD),
      bill(58, 12, 84, <path d="M0 -10 L3.4 0 L0 1 L-3.4 0Z" fill="#b4bdc8" stroke="#1c2024" strokeWidth="1.2" strokeLinejoin="round" />),
      helm(22, 11, 58, 0.8),
      helm(54, 11, 58, 0.8),
      helm(40, 11, 28, 0.7),
      discV(12, 22, 16, 11, 11, '#6a4526', { sw: 1.8 }),
      discV(12, 22, 16, 8, 8, '#2f6b5a', { sw: 1.2 }),
      boss(22, 12, 16, 3, 1),
      box(6, 0, 60, 14, 88, 92, WOOD_DK)
    ),
  // L4: an armoury wall: stone plinth and wall, an arched niche with a full suit of armour, shields and crossed axes either side
  () =>
    cat(
      stoneBox(2, 0, 70, 32, 0, 10, STONE_DK),
      stoneBox(2, 0, 70, 8, 10, 96, STONE),
      archV(8, 37, 15, 12, 58, 16, '#3b3340'),
      archV(8, 37, 12, 12, 58, 13, '#4a3d3c', { stroke: null }),
      discV(8, 12, 52, 8, 8, '#6a4526', { sw: 1.8 }),
      discV(8, 12, 52, 5.6, 5.6, CLOAK, { sw: 1.2 }),
      discV(8, 62, 52, 8, 8, '#6a4526', { sw: 1.8 }),
      discV(8, 62, 52, 5.6, 5.6, '#2f6b5a', { sw: 1.2 }),
      boss(12, 8, 52, 2.2, 1),
      boss(62, 8, 52, 2.2, 1),
      isoLines([[P(6, 8, 70), P(18, 8, 90)], [P(18, 8, 70), P(6, 8, 90)], [P(56, 8, 70), P(68, 8, 90)], [P(68, 8, 70), P(56, 8, 90)]], 2.6, WOOD),
      ...[12, 62].map((u) => bill(u, 8, 88, <path d="M-6 -2 q6 -8 12 0 l-2 4 l-8 0z" fill="#b4bdc8" stroke={DRAGON_INK} strokeWidth="1.2" strokeLinejoin="round" />)),
      box(2, 0, 70, 12, 92, 96, STONE_LT),
      armour(37, 14, 10, true, true, 0.82)
    )
]
