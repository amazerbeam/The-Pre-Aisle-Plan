import { P, ellipsePoints } from '../../iso'
import { cat, fmt, glowG } from '../packShapes'
import { AMBER, CABLE_DK, GUN, GUN_DK, GUN_LT, HAZ, HAZ_DK, LIME, NEON, OLIVE, PINK, ROBOT_INK, SCREEN, STEEL, STEEL_DK } from './robotPalette'
import { INKBLUE, bandAt, hat, limb, ringLine } from './robotDecorParts'
import { S, hazardU, sensor, slotsU } from './robotParts'

/**
 * MPP-47: the workshop's by-the-fridge, corner-by-the-door and front-of-the-room decor, 13 items (pip-room-robot.html ROBOT_ROOM.decor
 * lines 1547-1613). The legacy ids here (watering-can ... lemon-tree) are drawn in MPP-27 coords and slid by packDecorArt.
 */
const { poly, box, cyl, cylE, rectU, ellH, isoLine, isoLines, bill, fxg } = S

const COOLANT = '#e07a22'

/** A half-circle arch of points over a floor spot (handles of the battery crate and the cargo case). */
const arch = (n, fn) => Array.from({ length: n }, (_, i) => fn((i / (n - 1)) * Math.PI))

export const ROBOT_FLOOR_FRONT_DECOR = {
  /* ---------- by the fridge (legacy ids drawn at u 150-186, v 110-150; the battery crate in world coords) ---------- */
  // a coolant can: an orange body, a long spout and a handle
  'watering-can': () =>
    cat(
      cylE(169, 129, 5.5, 5.5, 0, 12, COOLANT, 6.5, 6.5),
      bandAt(169, 129, 6, 6, '#a24c10', 1.2),
      ellH(169, 129, 12, 5.2, 5.2, INKBLUE, { sw: 1 }),
      isoLine([P(174, 129, 8), P(184, 129, 16)], 4.6, ROBOT_INK),
      isoLine([P(174, 129, 8), P(184, 129, 16)], 2.4, COOLANT),
      isoLine([P(164, 129, 10), P(161, 129, 15), P(164, 129, 20), P(167, 129, 21)], 4.2, ROBOT_INK),
      isoLine([P(164, 129, 10), P(161, 129, 15), P(164, 129, 20), P(167, 129, 21)], 2, COOLANT)
    ),
  // a stack of four data tablets with a lit edge each, and a sensor cube on top
  'cookbook-stack': () =>
    cat(
      ...[[160, 122, 18, 14, 0, 3, STEEL_DK, NEON], [161, 123, 16, 12, 3, 6, GUN, PINK], [160, 122, 18, 14, 6, 9, STEEL, LIME], [162, 124, 14, 10, 9, 12, GUN, AMBER]].map(
        ([u, v, du, dv, h0, h1, c, edge]) =>
          cat(
            box(u, v, du, dv, h0, h1, c),
            glowG(edge, isoLine([P(u + du + 0.05, v + 1.5, (h0 + h1) / 2), P(u + du + 0.05, v + dv - 1.5, (h0 + h1) / 2)], 1.1, edge), 1.5)
          )
      ),
      sensor(169, 129, 12, 0.7)
    ),
  // a crash cushion: a squashy gunmetal pad with a neon stitch line
  'bean-bag': () =>
    cat(
      ellH(168, 130, 0, 16, 14, INKBLUE),
      bill(
        168,
        130,
        0,
        <>
          <path d="M-20 -2 q-2 -22 20 -24 q22 2 20 24 q-20 8 -40 0z" fill="#33475b" stroke={ROBOT_INK} strokeWidth="1.6" />
          <path d="M-12 -6 q12 6 24 0" stroke={GUN_DK} strokeWidth="1.4" fill="none" />
          {glowG(NEON, <path d="M-8 -14 q8 -6 16 0" stroke={NEON} strokeWidth="1.6" fill="none" strokeDasharray="3 2" />, 2)}
          <circle cx="-14" cy="-10" r="1.2" fill={STEEL} />
          <circle cx="14" cy="-10" r="1.2" fill={STEEL} />
        </>
      )
    ),
  // a hydroponic tube: a glass column of green liquid with bubbles blinking and leaves on top (animated)
  'lemon-tree': () =>
    cat(
      cylE(168, 130, 9, 9, 0, 14, GUN_DK, 10.5, 10.5),
      bandAt(168, 130, 9.8, 7, GUN, 1.2),
      isoLine([P(168, 130, 14), P(168, 130, 40)], 7.4, ROBOT_INK),
      isoLine([P(168, 130, 14), P(168, 130, 40)], 5, '#2e7d57', { op: 0.9 }),
      isoLine([P(166.6, 130, 16), P(166.6, 130, 38)], 1, '#e8fff4', { op: 0.7 }),
      bandAt(168, 130, 3.2, 24, STEEL, 1.4),
      bandAt(168, 130, 3.2, 32, STEEL, 1.4),
      bill(
        168,
        130,
        40,
        <>
          <path
            d="M0 0 q-10 -4 -13 -12 q10 -1 13 12z M0 0 q10 -5 14 -13 q-10 0 -14 13z M0 -2 q-3 -9 0 -15 q3 6 0 15z"
            fill="#5cd08a"
            stroke={ROBOT_INK}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {fxg(
            'blink',
            <>
              <circle cx="-1.6" cy="14" r="1.1" fill="#d7ffe8" />
              <circle cx="1.4" cy="20" r="1.4" fill="#d7ffe8" />
              <circle cx="-1" cy="26" r="1" fill="#d7ffe8" />
            </>
          )}
        </>
      )
    ),
  // a battery crate: an olive case with a handle, a lit vent and three cells inside
  'veg-basket': () =>
    cat(
      box(228, 140, 20, 20, 0, 12, OLIVE),
      rectU(248.05, 143, 157, 4, 9, CABLE_DK, { sw: 1 }),
      slotsU(248.1, 144, 156, 5, 8, 3, '#4a6a58', 0.8),
      ...[[233, 145, LIME], [238, 150, NEON], [243, 155, PINK]].map(([u, v, c]) => cat(cyl(u, v, 2.6, 12, 18, c, { sw: 1 }), ellH(u, v, 18.1, 1.4, 1.4, STEEL, { stroke: null }))),
      isoLine(arch(11, (t) => P(238 + 11 * Math.cos(t), 150, 12 + 12 * Math.sin(t))), 2.2, STEEL_DK)
    ),

  /* ---------- corner by the door (u 4-40, v 258-294, h 0-100) ---------- */
  // a dish stand: a pedestal under a tilted dish, a feed arm and a blinking tip (animated)
  monstera: () =>
    cat(
      cylE(22, 276, 8, 8, 0, 8, GUN_DK, 7, 7),
      cyl(22, 276, 2, 8, 34, STEEL_DK),
      bill(
        22,
        276,
        34,
        <>
          <g transform="translate(0 -14) rotate(-24)">
            <ellipse rx="18" ry="11" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.6" />
            <ellipse rx="14" ry="7.6" fill={GUN_LT} />
            <ellipse rx="3" ry="1.8" fill={GUN_DK} />
          </g>
          {limb('M0 -14 L13 -26', 1.4, STEEL_DK)}
          {glowG(LIME, fxg('blink', <circle cx="13" cy="-27" r="2" fill={LIME} />, 0.4), 3)}
        </>
      )
    ),
  // a stand holding a hi-vis vest and a hard hat
  'coat-stand': () =>
    cat(
      cyl(22, 276, 8, 0, 3, GUN_DK),
      cyl(22, 276, 1.6, 3, 80, STEEL_DK),
      ...[[28, 276], [16, 276], [22, 282], [22, 270]].map(([u, v]) => isoLine([P(22, 276, 72), P(u, v, 78)], 2.4, STEEL_DK)),
      bill(
        22,
        276,
        74,
        <>
          <path d="M-9 -3 q-3 18 1 34 h8 q-1 -20 0 -32z" fill={HAZ} stroke={ROBOT_INK} strokeWidth="1.3" strokeLinejoin="round" transform="translate(3 -2)" />
          <path d="M-5 8 h8 M-4.4 16 h8" stroke={HAZ_DK} strokeWidth="2.2" strokeLinecap="round" />
        </>
      ),
      hat(22, 276, 80, 0.7)
    ),
  // a work-light tripod: three legs, a pole and a bright panel buzzing (animated, glowing)
  'arc-lamp': () =>
    cat(
      ...[[14, 272], [30, 272], [22, 284]].map(([u, v]) => isoLine([P(22, 276, 58), P(u, v, 2)], 2.2, STEEL)),
      cylE(22, 276, 3, 3, 56, 60, GUN_DK, 3, 3),
      cyl(22, 276, 1.4, 60, 74, STEEL),
      bill(
        22,
        276,
        74,
        <>
          <rect x="-11" y="-16" width="22" height="14" rx="2.5" fill={GUN_DK} stroke={ROBOT_INK} strokeWidth="1.5" />
          {glowG(
            '#bff6ff',
            fxg(
              'buzz',
              <>
                <rect x="-9" y="-14" width="18" height="10" rx="1.5" fill="#eafcff" />
                <path d="M-9 -9 H9 M0 -14 V-4" stroke="#9fe8f5" strokeWidth=".8" />
              </>
            ),
            4
          )}
        </>
      )
    ),
  // a synth keyboard on an X-stand: keys, a small screen and three knobs
  guitar: () =>
    bill(
      16,
      276,
      0.8,
      <>
        {limb('M-13 0 L10 -20 M13 0 L-10 -20', 1.8, STEEL_DK)}
        <rect x="-18" y="-32" width="36" height="13" rx="2.4" fill={GUN_DK} stroke={ROBOT_INK} strokeWidth="1.5" />
        <rect x="-15" y="-30.6" width="11" height="4.2" rx="1" fill={SCREEN} />
        {glowG(NEON, <path d="M-14 -28.2 h3 l1.5 -1 l1.5 1.6 h3" stroke={NEON} strokeWidth=".9" fill="none" strokeLinecap="round" />, 2)}
        {[[3, PINK], [8, LIME], [13, AMBER]].map(([x, c]) => (
          <circle key={x} cx={x} cy="-28.4" r="1.5" fill={c} stroke={ROBOT_INK} strokeWidth=".7" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={fmt(-16 + i * 2.7)} y="-25" width="2.6" height="5.4" fill="#e8eef2" stroke={ROBOT_INK} strokeWidth=".6" />
        ))}
        {[0, 1, 3, 4, 5, 7, 8, 10].map((i) => (
          <rect key={i} x={fmt(-14.4 + i * 2.7)} y="-25" width="1.8" height="3.4" fill={ROBOT_INK} />
        ))}
      </>
    ),

  /* ---------- front of the room (u 172-208, v 232-268, h 0-40) ---------- */
  // a swivel stool: a round base, a stem and a padded seat with a neon rim
  pouffe: () =>
    cat(
      cylE(190, 250, 12, 12, 0, 3, GUN_DK, 12, 12),
      cyl(190, 250, 3, 3, 12, STEEL_DK),
      cylE(190, 250, 13, 13, 12, 17, '#3a4a5c', 12, 12),
      glowG(NEON, ringLine(190, 250, 17.3, 11, 11, 1.2, NEON), 2),
      ringLine(190, 250, 17.2, 7, 7, 1, '#2a3a4a')
    ),
  // a holo table: a round console with a neon rim, a flickering wire-cube hologram and two beakers (animated, glowing)
  'tea-table': () =>
    cat(
      cyl(190, 250, 8, 0, 2, GUN_DK),
      cyl(190, 250, 2.4, 2, 14, STEEL_DK),
      cylE(190, 250, 16, 16, 14, 17, GUN, 16, 16),
      glowG(NEON, bandAt(190, 250, 16, 15.5, NEON, 1.2), 2),
      bill(
        183,
        254,
        17,
        <>
          <path d="M-3 -6 h6 l-1 6 h-4z" fill="#9fe8f5" fillOpacity=".7" stroke={ROBOT_INK} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M-2.2 -2.6 h4.4 l-.5 2.6 h-3.4z" fill={PINK} />
        </>
      ),
      bill(
        197,
        256,
        17,
        <>
          <path d="M-3 -5 h6 l-1 5 h-4z" fill="#9fe8f5" fillOpacity=".7" stroke={ROBOT_INK} strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M-2.2 -2.2 h4.4 l-.5 2.2 h-3.4z" fill={LIME} />
        </>
      ),
      bill(
        190,
        250,
        17,
        <>
          <path d="M-5 0 L-8 -6 H8 L5 0Z" fill={NEON} opacity=".22" />
          {glowG(
            NEON,
            fxg('buzz', <path d="M0 -8 L6 -11 L6 -18 L0 -21 L-6 -18 L-6 -11Z M0 -8 V-15 M-6 -18 L0 -15 L6 -18" stroke={NEON} strokeWidth="1.2" fill="none" strokeLinejoin="round" />),
            3
          )}
        </>
      )
    ),
  // a drone ball: a gunmetal sphere with a neon equator and an orbit ring, glinting (animated)
  'pip-ball': () =>
    cat(
      poly(ellipsePoints(190, 250, 0.1, 8, 8), 'rgba(0,0,0,.14)', { stroke: null }),
      bill(
        190,
        250,
        8.8,
        glowG(
          NEON,
          <>
            <circle r="8" fill={GUN_LT} stroke={ROBOT_INK} strokeWidth="1.4" />
            <circle cx="-1.6" cy="-1.6" r="5.2" fill={STEEL} opacity=".7" />
            <path d="M-7.8 1 Q0 5 7.8 1" stroke={NEON} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M-6 -4 q4 -3 9 -1" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".85" />
            <ellipse rx="11" ry="3.2" fill="none" stroke={NEON} strokeWidth=".9" opacity=".7" />
            {fxg('buzz', <circle cx="9" cy="-1.4" r="1.6" fill={LIME} />)}
          </>,
          4
        )
      )
    ),
  // a cargo case: a slate crate with hazard end-straps, a handle and a lit lid plate
  'picnic-basket': () =>
    cat(
      isoLine(arch(11, (t) => P(190, 250 + 8 * Math.cos(t), 15 + 8 * Math.sin(t))), 2.4, STEEL),
      box(180, 242, 20, 16, 0, 12, '#3a4a5c'),
      isoLines([4, 8].map((h) => [P(200.05, 242.6, h), P(200.05, 257.4, h)]), 1, GUN_DK),
      isoLines([4, 8].map((h) => [P(180.6, 258.05, h), P(199.4, 258.05, h)]), 1, GUN_DK),
      hazardU(200.05, 242, 245, 0, 12, 3),
      hazardU(200.05, 255, 258, 0, 12, 3),
      box(179, 241, 22, 18, 12, 15, GUN),
      rectU(201.05, 247, 253, 12.4, 14.6, STEEL, { sw: 0.9 }),
      bill(
        194,
        254,
        15,
        <>
          <rect x="-6" y="-4" width="12" height="4" rx="1" fill={SCREEN} stroke={ROBOT_INK} strokeWidth="1" />
          <rect x="-4.5" y="-3" width="6" height="2" fill={LIME} />
        </>
      )
    )
}
