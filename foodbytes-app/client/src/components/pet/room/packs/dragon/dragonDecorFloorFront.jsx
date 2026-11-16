import { P, ellipsePoints, rectUPoints } from '../../iso'
import { cat, glowG } from '../packShapes'
import { CLOAK, DRAGON_INK, EMBER, GOLD, GOLD_DK, IRON, STONE, STONE_DK, STONE_LT, WOOD, WOOD_DK } from './dragonPalette'
import { BONE, COPPER, GLOW, TEAL, TEAL_HI, bandAt, candle, ringLine } from './dragonDecorParts'
import { embers, flame, gem, S } from './dragonParts'
import { helm } from './dragonTreasure'

/**
 * MPP-46: the lair's 13 front-floor decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, by the fridge, corner by the door and
 * front of the room). World coords; the 4 legacy ids are in MPP-27 coords and slid by packDecorArt.
 */
const { poly, isoLine, isoLines, box, rectU, cylE, cyl, ellH, bill, fxg } = S
const INK = DRAGON_INK

export const DRAGON_FLOOR_FRONT_DECOR = {
  /* ---------- by the fridge (legacy ids drawn at u 150-186, v 110-150; the veg basket in world coords) ---------- */
  // a copper ewer for quenching the forge
  'watering-can': () =>
    cat(
      cylE(169, 129, 5.5, 5.5, 0, 12, COPPER, 6.5, 6.5),
      bandAt(169, 129, 6, 6, '#8a4a22', 1.2),
      ellH(169, 129, 12, 5.2, 5.2, '#2a1a12', { sw: 1 }),
      isoLine([P(174, 129, 8), P(184, 129, 16)], 4.6, INK),
      isoLine([P(174, 129, 8), P(184, 129, 16)], 2.4, COPPER),
      isoLine([P(164, 129, 10), P(161, 129, 15), P(164, 129, 20), P(167, 129, 21)], 4.2, INK),
      isoLine([P(164, 129, 10), P(161, 129, 15), P(164, 129, 20), P(167, 129, 21)], 2, COPPER)
    ),
  // four leather spellbooks, stacked, one with a gem on top
  'cookbook-stack': () =>
    cat(
      box(160, 122, 18, 14, 0, 5, CLOAK),
      poly(rectUPoints(178.05, 123, 135, 0.8, 4.2), '#f4ead2', { stroke: null }),
      box(161, 123, 16, 12, 5, 10, TEAL),
      box(160, 122, 18, 14, 10, 15, '#4a3a7a'),
      poly(rectUPoints(178.05, 123, 135, 10.8, 14.2), '#f4ead2', { stroke: null }),
      box(162, 124, 14, 10, 15, 19, '#8a5a35'),
      rectU(176.05, 126, 132, 15.6, 18.4, GOLD, { stroke: null }),
      gem(169, 129, 19, '#7de3ff')
    ),
  // a crimson hide cushion with gold stitching and tassels
  'bean-bag': () =>
    cat(
      ellH(168, 130, 0, 16, 14, '#5a1c25'),
      bill(
        168,
        130,
        0,
        <>
          <path d="M-20 -2 q-2 -22 20 -24 q22 2 20 24 q-20 8 -40 0z" fill="#a8404c" stroke={INK} strokeWidth="1.6" />
          <path d="M-8 -14 q8 -6 16 0" stroke={GOLD} strokeWidth="2" fill="none" strokeDasharray="3 2" />
          <path d="M-12 -6 q12 6 24 0" stroke="#5a1c25" strokeWidth="1.4" fill="none" />
          <circle cx="-19" cy="-3" r="2.2" fill={GOLD} stroke={INK} strokeWidth="1" />
          <circle cx="19" cy="-3" r="2.2" fill={GOLD} stroke={INK} strokeWidth="1" />
        </>
      )
    ),
  // a potted tree hung with glowing ember-fruit (animated glints)
  'lemon-tree': () =>
    cat(
      cylE(168, 130, 9, 9, 0, 14, STONE_DK, 10.5, 10.5),
      bandAt(168, 130, 9.8, 7, '#4a4858', 1.2),
      isoLine([P(168, 130, 14), P(168, 130, 34)], 2.6, '#5a4636'),
      bill(
        168,
        130,
        46,
        <>
          <circle r="15" fill="#1f5b4c" stroke={INK} strokeWidth="1.6" />
          <circle cx="-4" cy="-5" r="8" fill="#2f8f7a" opacity=".55" />
          {cat(
            ...[[-6, -3, 0], [5, 4, 0.8], [4, -8, 1.5], [-3, 7, 2.2]].map(([x, y, d]) =>
              glowG(
                '#ff8a2a',
                fxg(
                  'glint',
                  <>
                    <circle cx={x} cy={y} r="3" fill="#ff8a2a" stroke={INK} strokeWidth="0.9" />
                    <circle cx={x - 0.8} cy={y - 0.8} r=".8" fill="#ffe27a" />
                  </>,
                  d
                ),
                3
              )
            )
          )}
        </>
      )
    ),
  // a forage basket: glowcaps, a roast leg and an egg
  'veg-basket': () =>
    cat(
      cylE(238, 150, 10, 10, 0, 12, '#b88a4a', 12, 12),
      bandAt(238, 150, 10.8, 4, '#7a5a2a', 1.2),
      bandAt(238, 150, 11.4, 8, '#7a5a2a', 1.2),
      ellH(238, 150, 12, 10.6, 10.6, '#3a2a1e', { sw: 1 }),
      isoLine(Array.from({ length: 11 }, (_, i) => P(238 + 11 * Math.cos((i / 10) * Math.PI), 150, 12 + 12 * Math.sin((i / 10) * Math.PI))), 2.2, WOOD_DK),
      bill(
        238,
        150,
        12,
        <>
          <path d="M-6 0 v-6 M-1.6 0 v-4" stroke="#cfeee6" strokeWidth="2" strokeLinecap="round" />
          {glowG(
            '#38d6c4',
            <>
              <path d="M-10 -6 Q-6 -14 -2 -6Z" fill="#38d6c4" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
              <path d="M-4 -4 Q-1.6 -10 1 -4Z" fill="#7de3ff" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
            </>,
            2
          )}
          <path d="M3 -3 q4 -8 9 -4 q2 4 -2 6 q-4 2 -7 -2z" fill="#b5502e" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M3 -4 l-3 -5" stroke={BONE} strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="-1" cy="-2" rx="3" ry="3.6" fill="#b5e0c9" stroke={INK} strokeWidth="1" />
        </>
      )
    ),

  /* ---------- corner by the door (u 4-40, v 258-294, h 0-100) ---------- */
  // a stone urn of broad leaves with glowing veins
  monstera: () =>
    cat(
      cylE(22, 276, 8, 8, 0, 18, STONE, 10, 10),
      bandAt(22, 276, 9.2, 12, STONE_DK, 1.6),
      ellH(22, 276, 18, 8.6, 8.6, '#3a2a1e', { sw: 1 }),
      bill(
        22,
        276,
        18,
        <>
          <path d="M0 0 L-10 -20 M0 0 L8 -26 M0 0 L-2 -40" stroke="#1f5b4c" strokeWidth="2" />
          {cat(
            ...[[-10, -26, -30], [8, -34, 25], [-2, -50, 0], [12, -18, 50]].map(([x, y, r]) => (
              <g transform={`translate(${x} ${y}) rotate(${r})`}>
                <path d="M0 12 C-14 4 -12 -12 0 -12 C12 -12 14 4 0 12z" fill="#1f5b4c" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M0 12 C-8 6 -8 -8 0 -12 C-3 -4 -2 4 0 12z" fill="#2f8f7a" />
                {glowG(GLOW, <path d="M0 12 V-10 M0 0 L-7 -4 M0 4 L7 0" stroke={GLOW} strokeWidth="1.1" fill="none" />, 2)}
              </g>
            ))
          )}
        </>
      )
    ),
  // a stand holding a crimson cloak and a horned helm
  'coat-stand': () =>
    cat(
      cyl(22, 276, 8, 0, 3, WOOD_DK),
      cyl(22, 276, 1.6, 3, 80, WOOD),
      ...[[28, 276], [16, 276], [22, 282], [22, 270]].map(([u, v]) => isoLine([P(22, 276, 72), P(u, v, 78)], 2.4, WOOD)),
      bill(
        22,
        276,
        74,
        <>
          <path d="M-9 -3 q-3 18 1 34 h8 q-1 -20 0 -32z" fill={CLOAK} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" transform="translate(3 -2)" />
          <path d="M-5 4 q-1 10 0 18" stroke="#c9626e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="-5" cy="-4" r="2" fill={GOLD} stroke={INK} strokeWidth="1" />
        </>
      ),
      helm(22, 276, 80, 0.7)
    ),
  // a tall iron stand with a brazier: flame and embers (animated, glowing)
  'arc-lamp': () =>
    cat(
      cyl(22, 276, 7, 0, 2.5, IRON),
      ...[[14, 272], [30, 272], [22, 284]].map(([u, v]) => isoLine([P(22, 276, 58), P(u, v, 2)], 2.2, IRON)),
      cyl(22, 276, 1.8, 2.5, 60, IRON),
      cylE(22, 276, 4, 4, 60, 68, IRON, 9, 9),
      ellH(22, 276, 68, 8, 8, '#4a1c12', { sw: 1 }),
      ellH(22, 276, 68.2, 5.4, 5.4, EMBER, { stroke: null }),
      flame(22, 276, 68.5, 0.95, 0.2),
      embers(22, 276, 76, 3)
    ),
  // a lute with a scaled body, a gold sound-hole and bone pegs, on a small stand
  guitar: () =>
    bill(
      12,
      276,
      0.8,
      <>
        <path d="M-7 0 L0 -5 L7 0 M0 -5 V-9" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <g transform="translate(0 -7) rotate(-12)">
          <path d="M0 -2 c-10 0 -12 -10 -6 -14 c-4 -6 0 -12 6 -12 c6 0 10 6 6 12 c6 4 4 14 -6 14z" fill="#1f5b4c" stroke={INK} strokeWidth="1.4" transform="translate(2 1.2)" />
          <path d="M0 -2 c-10 0 -12 -10 -6 -14 c-4 -6 0 -12 6 -12 c6 0 10 6 6 12 c6 4 4 14 -6 14z" fill={TEAL_HI} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M-6 -6 q3 3 6 0 q3 3 6 0 M-5 -12 q2.5 3 5 0 q2.5 3 5 0 M-3 -19 q3 3 6 0" stroke="#1f6b4c" strokeWidth="1" fill="none" />
          <circle cy="-14" r="2.8" fill="#14181c" stroke={GOLD} strokeWidth="1.4" />
          <rect x="-4" y="-8" width="8" height="1.8" fill={BONE} />
          <rect x="-1.5" y="-56" width="3" height="30" fill="#4a3a2a" stroke={INK} strokeWidth="1" />
          <path d="M-.7 -8 V-56 M.7 -8 V-56" stroke="#f1f0f6" strokeWidth=".6" />
          <path d="M-1.5 -34 h3 M-1.5 -42 h3 M-1.5 -50 h3" stroke={INK} strokeWidth=".8" />
          <rect x="-3" y="-62" width="6" height="7" rx="1" fill="#4a3a2a" stroke={INK} strokeWidth="1.2" />
          <circle cx="-4" cy="-60" r="1.2" fill={BONE} />
          <circle cx="4" cy="-60" r="1.2" fill={BONE} />
        </g>
      </>
    ),

  /* ---------- front of the room (u 172-208, v 232-268, h 0-40) ---------- */
  // a tree-stump seat with growth rings
  pouffe: () =>
    cat(
      cylE(190, 250, 13, 13, 0, 16, '#7a5a3a', 12, 12),
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const t = (i / 6) * Math.PI * 2 + 0.3
        return isoLine([P(190 + 12 * Math.cos(t), 250 + 12 * Math.sin(t), 2), P(190 + 11.5 * Math.cos(t), 250 + 11.5 * Math.sin(t), 14)], 1, '#4a3320', { op: 0.5 })
      }),
      ellH(190, 250, 16, 12, 12, '#c9a06a', { sw: 1.4 }),
      ringLine(190, 250, 16.2, 8.6, 8.6, 1, '#8a5a35'),
      ringLine(190, 250, 16.2, 4.6, 4.6, 1, '#8a5a35'),
      ellH(190, 250, 16.3, 1.4, 1.4, '#8a5a35', { stroke: null }),
      bill(
        184,
        244,
        16,
        <>
          <ellipse rx="4" ry="1.6" fill="#5d8a43" stroke="#2f5a2a" strokeWidth=".8" />
          <ellipse cx="1" cy="-.8" rx="2" ry=".9" fill="#86b85e" />
        </>
      )
    ),
  // a round stone feast table: two goblets and a candle (animated flame)
  'tea-table': () =>
    cat(
      cyl(190, 250, 8, 0, 2, STONE_DK),
      cyl(190, 250, 2.4, 2, 20, STONE),
      cylE(190, 250, 16, 16, 20, 23, STONE_LT, 16, 16),
      bandAt(190, 250, 16, 21.5, STONE_DK, 1),
      bill(
        184,
        250,
        23,
        <>
          <path d="M-4 -7 h8 q0 5 -4 6 q-4 -1 -4 -6z" fill={GOLD} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M0 -1 v3" stroke={INK} strokeWidth="1.5" />
          <ellipse cy="2" rx="3.2" ry="1.1" fill={GOLD_DK} stroke={INK} strokeWidth="1" />
          <path d="M-2.4 -6 q-.4 2 .6 3" stroke="#fff6c2" strokeWidth="1" fill="none" strokeLinecap="round" />
        </>
      ),
      bill(
        197,
        256,
        23,
        <>
          <path d="M-3 -5 h6 q0 4 -3 5 q-3 -1 -3 -5z" fill={GOLD} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cy="1.6" rx="2.6" ry=".9" fill={GOLD_DK} stroke={INK} strokeWidth=".9" />
        </>
      ),
      candle(190, 244, 23, 4, 0.4, 0.9)
    ),
  // a glowing orb Pip bats about (animated glint)
  'pip-ball': () =>
    cat(
      poly(ellipsePoints(190, 250, 0.1, 8, 8), 'rgba(0,0,0,.14)', { stroke: null }),
      bill(
        190,
        250,
        8.8,
        glowG(
          '#7de3ff',
          <>
            <circle r="8" fill="#5cc4e8" stroke={INK} strokeWidth="1.4" />
            <circle cx="-1.6" cy="-1.6" r="5.2" fill="#9eeaff" opacity=".75" />
            <path d="M-6 1 q4 -6 9 -3 M-3 5 q6 -2 8 -7" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".85" />
            {fxg('glint', <path d="M-3.4 -4.6 l.8 -2 l.8 2 l2 .8 l-2 .8 l-.8 2 l-.8 -2 l-2 -.8z" fill="#fff" />)}
          </>,
          4
        )
      )
    ),
  // a rope-handled provision crate with a cloth cover and a roast leg
  'picnic-basket': () =>
    cat(
      isoLine(Array.from({ length: 11 }, (_, i) => P(190, 250 + 8 * Math.cos((i / 10) * Math.PI), 15 + 8 * Math.sin((i / 10) * Math.PI))), 2.4, '#c9a06a'),
      box(180, 242, 20, 16, 0, 12, WOOD),
      isoLines([4, 8].map((h) => [P(200.05, 242.6, h), P(200.05, 257.4, h)]), 1, WOOD_DK),
      isoLines([4, 8].map((h) => [P(180.6, 258.05, h), P(199.4, 258.05, h)]), 1, WOOD_DK),
      rectU(200.05, 242, 245, 0, 12, IRON),
      rectU(200.05, 255, 258, 0, 12, IRON),
      box(179, 241, 22, 18, 12, 15, '#8e2f3a'),
      bill(
        194,
        254,
        15,
        <>
          <path d="M-6 -3 q5 -8 11 -3 q2 4 -2 6 q-6 2 -9 -3z" fill="#b5502e" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5 -6 l5 -3" stroke={BONE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="10.5" cy="-9" r="1.8" fill={BONE} stroke={INK} strokeWidth=".8" />
        </>
      )
    )
}
