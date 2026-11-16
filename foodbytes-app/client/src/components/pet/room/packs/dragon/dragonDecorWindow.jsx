import { P } from '../../iso'
import { cat, glowG, tint } from '../packShapes'
import { DRAGON_INK, EMBER, GOLD, GOLD_DK, GOLD_HI, IRON, IRON_LT, STONE, STONE_LT, WOOD } from './dragonPalette'
import { BONE, HI, HIDE, bandAt, candle, orb, slabU } from './dragonDecorParts'
import { crystal, embers, flame, gem, S } from './dragonParts'

/**
 * MPP-46: the lair's 10 window-dressing and windowsill decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, window dressing
 * and windowsill). World coords.
 */
const { poly, isoLine, isoLines, box, cylE, ellH, rectU, bill, fxg } = S
const INK = DRAGON_INK

export const DRAGON_WINDOW_DECOR = {
  /* ---------- window dressing (right wall, v 156-244, above the sill) ---------- */
  // patchwork hide panels on a bone rod
  'curtains-gingham': () => {
    const tones = [HIDE, '#8f6e4a', '#bf9e74']
    const panel = ([a, b]) =>
      cat(
        box(0.5, a, 1.8, b - a, 74, 141, HIDE),
        ...[0, 1, 2].flatMap((c) => [0, 1, 2, 3, 4].map((r) => rectU(2.35, a + c * 5, a + c * 5 + 5, 74 + r * 13.4, 74 + (r + 1) * 13.4, tones[(c + r) % 3], { stroke: null }))),
        isoLines([5, 10].map((d) => [P(2.4, a + d, 74), P(2.4, a + d, 141)]), 1, '#5a4026', 0.7),
        ...[0, 1, 2, 3, 4].map((k) => poly([P(2.35, a + k * 3 + 0.6, 74), P(2.35, a + k * 3 + 3, 74), P(2.35, a + k * 3 + 1.8, 70)], '#8f6e4a', { sw: 0.8 }))
      )
    return cat(
      box(0.4, 155, 2, 86, 141, 143.5, BONE),
      ...[154, 240.5].map((v) => box(0.4, v, 2, 1.5, 139.5, 146, IRON_LT)),
      ...[[158, 173], [223, 238]].map((ab) => panel(ab))
    )
  },
  // crimson velvet drapes tied back with a gold cord
  'curtains-linen': () => {
    const left = [[158, 141], [176, 141], [171, 104], [169, 100], [171, 96], [178, 74], [158, 74]]
    const right = left.map(([v, h]) => [396 - v, h])
    return cat(
      box(0.4, 155, 2, 86, 141, 143.5, GOLD),
      ...[154, 240.5].map((v) => box(0.4, v, 2, 1.5, 139.5, 146, GOLD_DK)),
      slabU(0.6, 1.6, left, '#8e2f3a'),
      slabU(0.6, 1.6, right, '#8e2f3a'),
      isoLines([161.5, 165.5, 396 - 161.5, 396 - 165.5].map((v) => [P(2.2, v, 140), P(2.2, v, 75)]), 1, '#5a1c25', 0.8),
      isoLines([[P(2.3, 158, 141), P(2.3, 176, 141)], [P(2.3, 220, 141), P(2.3, 238, 141)]], 1.6, GOLD_HI),
      isoLines([[P(2.3, 158, 100), P(2.3, 169, 100)], [P(2.3, 238, 100), P(2.3, 227, 100)]], 2.6, GOLD)
    )
  },
  // an iron portcullis raised partway: a beam, bars with spiked tips
  'roller-blind': () => {
    const vs = Array.from({ length: 9 }, (_, i) => 168 + i * 7.5)
    const bars = vs.map((v) => [P(1.8, v, 108), P(1.8, v, 133)])
    const cross = [114, 124].map((h) => [P(1.8, 166, h), P(1.8, 230, h)])
    return cat(
      box(0.5, 162, 2, 3, 131, 141, IRON),
      box(0.5, 231, 2, 3, 131, 141, IRON),
      box(0.5, 165, 2, 66, 133, 139, IRON_LT),
      isoLines([...bars, ...cross], 4.4, INK),
      isoLines([...bars, ...cross], 2.2, IRON),
      ...vs.map((v) => poly([P(1.8, v - 1.8, 108), P(1.8, v + 1.8, 108), P(1.8, v, 99)], IRON_LT, { sw: 1 })),
      isoLine([P(2.3, 167, 132), P(2.3, 229, 132)], 1, HI)
    )
  },
  // wires of glowing glowworm orbs (animated glints)
  'window-lights': () => {
    const cols = ['#7de3ff', '#b6f06a', '#ffd34d', '#ff8fab', '#b58cff']
    const wire = Array.from({ length: 13 }, (_, i) => [160 + i * 6.3, 140 - Math.sin((i / 12) * Math.PI) * 8])
    const parts = [isoLine(wire.map(([v, h]) => P(1, v, h)), 1.3, IRON)]
    wire.slice(1, -1).forEach(([v, h], i) => {
      parts.push(orb(1, v, h - 3, cols[i % 5], (i % 6) * 0.45))
    })
    for (const v0 of [160, 236]) {
      const strand = [0, 1, 2, 3, 4, 5].map((k) => [v0 + Math.sin(k) * 2, 136 - k * 13])
      parts.push(isoLine(strand.map(([v, h]) => P(1, v, h)), 1.3, IRON))
      strand.slice(1).forEach(([v, h], k) => {
        parts.push(orb(1, v, h, cols[(k + 2) % 5], k * 0.55))
      })
    }
    return cat(...parts)
  },
  // a brazier on three chains, a low flame and rising embers (animated, glowing)
  'plant-hanger': () =>
    cat(
      ...[[13, 198], [8, 203], [8, 193]].map(([u, v]) => isoLine([P(8, 198, 150), P(u, v, 130)], 1.3, IRON_LT)),
      cylE(8, 198, 3.5, 3.5, 120, 130, IRON, 6.6, 6.6),
      ellH(8, 198, 130, 5.6, 5.6, '#4a1c12', { sw: 1 }),
      ellH(8, 198, 130.2, 3.4, 3.4, EMBER, { stroke: null }),
      flame(8, 198, 130.5, 0.6, 0.5),
      embers(8, 198, 134, 3)
    ),

  /* ---------- windowsill (stone ledge at h 74, u 3-14) ---------- */
  // three clay pots of glowing cave mushrooms (animated spots)
  'sill-basil': () =>
    cat(
      ...[178, 198, 218].map((v, i) =>
        cat(
          cylE(8.5, v, 3.6, 3.6, 74, 81, '#6a4526', 4.4, 4.4),
          bandAt(8.5, v, 4, 77.5, '#3a2616', 1.1),
          bill(
            8.5,
            v,
            81,
            glowG(
              '#38d6c4',
              <>
                <path d="M-3 0 v-6 M2.4 0 v-4" stroke="#cfeee6" strokeWidth="2" strokeLinecap="round" />
                <path d="M-8 -6 Q-3 -15 2 -6Z" fill="#38d6c4" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M-.2 -4 Q2.4 -10 5 -4Z" fill="#7de3ff" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
                {fxg(
                  'glint',
                  <>
                    <circle cx="-4.6" cy="-9" r="1" fill="#fff" />
                    <circle cx="-1.2" cy="-8" r=".8" fill="#fff" />
                    <circle cx="2.6" cy="-6" r=".7" fill="#fff" />
                  </>,
                  i * 0.7
                )}
              </>,
              3
            )
          )
        )
      )
    ),
  // three stone bases, each holding a small cluster of gem crystals
  'sill-succulents': () =>
    cat(
      ...[[178, '#d63a4a'], [198, '#4aa8e8'], [218, '#5cc46a']].map(([v, c]) =>
        cat(
          cylE(8.5, v, 3.4, 3.4, 74, 79, STONE, 4.2, 4.2),
          crystal(7, v - 3, 3, 3, 79, 84, c),
          crystal(9.5, v - 0.5, 3, 3, 79, 87, tint(c, 22)),
          crystal(6.5, v + 1.5, 2.4, 2.4, 79, 83, c)
        )
      )
    ),
  // a tall and a squat stalagmite, one tipped with a gem
  'sill-cactus': () =>
    cat(
      cylE(8.5, 186, 4.5, 4.5, 74, 83, STONE, 3.2, 3.2),
      cylE(8.5, 186, 3.2, 3.2, 83, 91, STONE_LT, 1.1, 1.1),
      gem(8.5, 186, 91, '#4aa8e8'),
      cylE(8.5, 214, 3.8, 3.8, 74, 80, STONE, 2.6, 2.6),
      cylE(8.5, 214, 2.6, 2.6, 80, 86, STONE_LT, 0.9, 0.9),
      isoLines([[P(7, 188, 76), P(7.6, 188, 88)], [P(7, 216, 76), P(7.6, 216, 84)]], 1, HI)
    ),
  // a bone horn on a wooden rest, a candle beside it (animated flame)
  'sill-radio': () =>
    cat(
      box(3.2, 182, 8, 20, 74, 80, WOOD),
      bill(
        7.2,
        192,
        80,
        <>
          <path d="M-10 -2 C-10 -12 4 -18 12 -9 C14 -6 12 -2 9 -3 C10 -8 4 -10 0 -6 C-3 -3 -4 0 -4 2 Z" fill={BONE} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M-6 -9 q2 3 1 6 M-1 -13 q2 3 1 6 M4 -13 q3 2 3 5" stroke="#b7a57e" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <rect x="-11" y="-3" width="4.5" height="5" rx="1" fill={GOLD} stroke={INK} strokeWidth="1.1" />
        </>
      ),
      candle(8.5, 222, 74)
    ),
  // a small golden dragon idol on a plinth, a candle beside it (animated flame)
  'sill-cat': () =>
    cat(
      box(5.5, 184, 6, 6, 74, 76, STONE_LT),
      bill(
        8.5,
        187,
        76,
        <>
          <path d="M6 -1 Q14 -2 12 -9 Q11 -12 9 -10" fill="none" stroke={INK} strokeWidth="4.6" strokeLinecap="round" />
          <path d="M6 -1 Q14 -2 12 -9 Q11 -12 9 -10" fill="none" stroke={GOLD_DK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M-5 -9 q-8 -6 -7 -14 q5 3 8 8z" fill={GOLD_HI} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cy="-6" rx="6.5" ry="6.5" fill={GOLD} stroke={INK} strokeWidth="1.3" />
          <ellipse cy="-5" rx="3.4" ry="4.4" fill={GOLD_HI} />
          <circle cy="-15" r="4.8" fill={GOLD} stroke={INK} strokeWidth="1.3" />
          <path d="M-3 -18.5 l-2 -4 l3.4 2z M3 -18.5 l2 -4 l-3.4 2z" fill={GOLD_HI} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <circle cx="-1.8" cy="-15.6" r=".9" fill="#d63a4a" />
          <circle cx="1.8" cy="-15.6" r=".9" fill="#d63a4a" />
          <path d="M-1.6 -12.6 h3.2" stroke="#8a5a14" strokeWidth="1" strokeLinecap="round" />
        </>
      ),
      candle(8.5, 216, 74)
    )
}
