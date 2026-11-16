import { P } from '../../iso'
import { cat } from '../packShapes'
import { GOLD, GOLD_DK, STONE, STONE_DK } from './dragonPalette'
import { S, coinRing, egg, flame, gem, mound, sparkle, stoneBox } from './dragonParts'
import { crown, drape, nest, pelt, trophy } from './dragonTreasure'

/**
 * MPP-45: the dragon lair's nest, four levels (pip-room-dragon.html DRAGON_ROOM.stations.bed, line 1223). The sleeping surface is
 * STATION_ANCHORS.bedTop (L1 h 5, L2-L4 h 30). Each level returns { back, front }; front is the near rim, drawn over the creature.
 */
const { box, isoLines } = S

export const DRAGON_BED = [
  // L1: a straw nest on the floor, a speckled egg in the hollow
  () => {
    const n = nest(47, 148, 36.5, 25.5, 0, 9, '#c9a24a', '#8f6f26', 5)
    return { back: cat(n.back, egg(29, 152, 9)), front: n.front }
  },
  // L2: a bigger nest on a rock ledge, lined with a fur and draped with another
  () => {
    const n = nest(44, 148, 31, 21, 19, 30, '#c9a24a', '#8f6f26', 11)
    const rock = cat(stoneBox(8, 124, 72, 46, 0, 10, STONE_DK), stoneBox(13, 128, 62, 38, 10, 19, STONE))
    const furTone = '#a98660'
    return {
      back: cat(rock, n.back, pelt(44, 148, 21, 13.5, 29.4, furTone, 4), egg(33, 152, 29.5)),
      front: cat(
        n.front,
        drape(44, 148, 31, 21, 30.5, 20.5, furTone),
        isoLines([[P(20, 160, 29), P(18, 164, 23)], [P(30, 166, 29), P(29, 170, 23)], [P(44, 169, 29), P(44, 173, 23)], [P(58, 166, 29), P(60, 170, 23)]], 1.1, '#6f5238', 0.8)
      )
    }
  },
  // L3: the nest on a heap with a scatter of coins, gems and a goblet
  () => {
    const heap = mound(44, 148, 41, 27, 18, 4, '#d4a42a', 0.7)
    const n = nest(40, 148, 24, 16.5, 18, 30, '#c9a24a', '#8f6f26', 17)
    const coins = []
    for (let i = 0; i < 4; i++) coins.push(coinRing(44, 148, 41 * (1 - 0.3 * (i / 4)), 27 * (1 - 0.3 * (i / 4)), 0.55 + i * 0.05, 0.98 - i * 0.12, (i + 1) * 4.5 + 0.3, 9, 40 + i))
    return {
      back: cat(
        heap,
        ...coins,
        gem(74, 160, 6, '#d63a4a'),
        gem(20, 168, 5, '#4aa8e8'),
        gem(78, 140, 6, '#5cc46a'),
        trophy(70, 168, 6, 0.5),
        n.back,
        sparkle(66, 152, 12, 0),
        sparkle(24, 162, 10, 1.1),
        sparkle(54, 132, 14, 1.9)
      ),
      front: n.front
    }
  },
  // L4: the nest on a gold pile with a hoard against the wall: crown, candelabra, gems
  () => {
    const heap = mound(46, 148, 44, 29, 22, 5, '#d4a42a', 0.62)
    const n = nest(40, 148, 24, 16.5, 22, 30, '#c9a24a', '#8f6f26', 23)
    const wall = mound(12, 150, 12, 27, 48, 6, '#e0b030', 0.5)
    const coins = []
    for (let i = 0; i < 5; i++) coins.push(coinRing(46, 148, 44 * (1 - 0.38 * (i / 5)), 29 * (1 - 0.38 * (i / 5)), 0.55 + i * 0.04, 0.98 - i * 0.1, (i + 1) * 4.4 + 0.3, 9, 60 + i))
    const candles = [121, 127, 133].map((v) => cat(box(5, v, 2, 2, 93, 100, '#f4ead2', { sw: 1 }), flame(6, v + 1, 100, 0.55, v % 3)))
    const candelabra = cat(box(5, 125, 3, 3, 14, 91, GOLD_DK), box(4, 119, 5, 18, 90, 93, GOLD), ...candles)
    return {
      back: cat(
        heap,
        ...coins,
        wall,
        coinRing(12, 150, 12, 27, 0.1, 0.6, 30, 6, 81),
        candelabra,
        crown(12, 150, 48, 0.8),
        gem(80, 160, 8, '#d63a4a'),
        gem(18, 170, 8, '#4aa8e8'),
        gem(74, 134, 8, '#5cc46a'),
        trophy(76, 166, 8, 0.55),
        n.back,
        sparkle(66, 156, 14, 0),
        sparkle(24, 168, 12, 0.8),
        sparkle(14, 140, 34, 1.5),
        sparkle(12, 162, 28, 2.2),
        sparkle(60, 130, 12, 1.1)
      ),
      front: n.front
    }
  }
]
