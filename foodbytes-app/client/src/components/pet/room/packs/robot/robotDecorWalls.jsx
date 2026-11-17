import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { AMBER, CABLE_DK, GUN, GUN_DK, GUN_LT, HAZ, HAZ_DK, LIME, NEON, PINK, ROBOT_INK, SCREEN, STEEL, STEEL_DK } from './robotPalette'
import { HI, ellU, digit7, hat, limb, slabU } from './robotDecorParts'
import { S, led, ledOn, scanU, scanV, screenV, traceU, traceV } from './robotParts'

/**
 * MPP-47: the workshop's wall decor, 14 items (pip-room-robot.html ROBOT_ROOM.decor lines 1292-1372). Builders return art in world
 * coords; the 12 legacy ids are drawn in MPP-27 coords and slid by packDecorArt.
 */
const { poly, box, cyl, cylE, rectV, rectU, isoLine, isoLines, bill, fxg } = S

export const ROBOT_WALL_DECOR = {
  /* ---------- over the wardrobe (left wall; legacy ids drawn at u 150-186, h 128-176) ---------- */
  // a circuit-board poster: a dark plate, a chip, glowing traces and solder pads
  'basil-print': () =>
    cat(
      rectV(0, 154, 182, 136, 166, GUN_DK),
      rectV(0, 157, 179, 139, 163, '#0e2a2a'),
      rectV(0, 166, 172, 149, 155, CABLE_DK, { sw: 1 }),
      glowG(
        LIME,
        cat(
          isoLine([P(160, 0, 160), P(166, 0, 160), P(166, 0, 152), P(174, 0, 152), P(174, 0, 158), P(177, 0, 158)], 1.1, LIME),
          isoLine([P(160, 0, 144), P(168, 0, 144), P(168, 0, 148), P(172, 0, 148)], 1.1, LIME),
          isoLine([P(174, 0, 144), P(177, 0, 144), P(177, 0, 150)], 1.1, LIME)
        ),
        2
      ),
      ...[[160, 160], [177, 158], [172, 148], [177, 150], [160, 144]].map(([u, h]) => bill(u, 0, h, <circle r="1.6" fill={AMBER} stroke={ROBOT_INK} strokeWidth=".7" />))
    ),
  // a schematic slate: a screen of text lines with a scan sweep (animated)
  'recipe-board': () =>
    cat(
      rectV(0, 152, 184, 134, 168, GUN),
      screenV(0, 155, 181, 137, 165, LIME),
      ...[160, 155, 150, 145, 140].map((h, i) => traceV(0, [[158, h], [158 + [18, 12, 20, 9, 15][i], h]], LIME, 1)),
      scanV(0, 155, 181, 137, 165)
    ),
  // a sample rack: a steel shelf on two brackets holding three glowing vials
  'herb-shelf': () =>
    cat(
      ...[154, 180].map((u) => box(u, 0, 3, 6, 128, 136, GUN_DK)),
      box(150, 0, 36, 8, 136, 140, GUN),
      ...[[156, NEON], [168, PINK], [180, LIME]].map(([u, c]) =>
        glowG(
          c,
          cat(
            cyl(u, 4, 3.4, 140, 147, c, { sw: 1.2 }),
            bill(
              u,
              4,
              147,
              <>
                <rect x="-1.4" y="-5" width="2.8" height="5" fill="#d7f0ff" stroke={ROBOT_INK} strokeWidth="1.1" />
                <rect x="-2" y="-7.6" width="4" height="2.6" rx="1" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1" />
              </>
            )
          ),
          2
        )
      )
    ),
  // an LED strip: a cable run with five lights chasing along it (animated)
  'fairy-lights': () => {
    const at = (i) => [150 + i * 6, 166 - Math.sin((i / 6) * Math.PI) * 10]
    const run = Array.from({ length: 7 }, (_, i) => P(at(i)[0], 0, at(i)[1]))
    return cat(
      isoLine(run, 3.6, CABLE_DK),
      isoLine(run, 1, STEEL_DK, { op: 0.8 }),
      ...[NEON, PINK, LIME, AMBER, NEON].map((c, i) => led(at(i + 1)[0], 0, at(i + 1)[1], c, i * 0.3))
    )
  },
  // a framed monitor showing Pip's scan portrait (animated sweep)
  'pip-portrait': () =>
    cat(
      box(24, 0, 28, 2.4, 106, 138, GUN_DK),
      rectV(2.55, 27, 49, 109, 135, SCREEN),
      bill(
        38,
        2.7,
        121,
        <>
          <rect x="-8" y="-11" width="16" height="13" rx="3.5" fill={GUN_LT} stroke={ROBOT_INK} strokeWidth="1.4" />
          <rect x="-5.6" y="-8" width="11.2" height="7" rx="1.8" fill={SCREEN} />
          <rect x="-4" y="-6.4" width="2.8" height="3.2" fill={NEON} />
          <rect x="1.2" y="-6.4" width="2.8" height="3.2" fill={NEON} />
          <path d="M-1.8 -2.4 h3.6" stroke={NEON} strokeWidth="1" strokeLinecap="round" />
          <path d="M0 -11 V-14.5" stroke={ROBOT_INK} strokeWidth="1.4" />
          <circle cy="-14.8" r="1.4" fill={PINK} />
        </>
      ),
      scanV(2.6, 27, 49, 109, 135)
    ),

  /* ---------- bedside wall (right wall, v 134-154: tall and narrow) ---------- */
  // a height gauge: a steel post with tick marks, a glowing level marker and a readout
  'growth-chart': () =>
    cat(
      box(0, 137, 1.8, 12, 62, 122, GUN),
      isoLines([70, 80, 90, 100, 110].map((h, i) => [P(1.95, 138.4, h), P(1.95, i % 2 ? 141 : 143.2, h)]), 1.2, ROBOT_INK),
      rectU(1.95, 138, 148, 114, 119, '#0e2a2a', { sw: 1 }),
      traceU(2, [[139, 116.5], [147, 116.5]], LIME, 1),
      glowG(NEON, isoLine([P(1.95, 138, 92), P(1.95, 148, 92)], 1.4, NEON), 2),
      ledOn(1.95, 146, 86, AMBER)
    ),
  // a schedule panel: a screen grid, some cells lit
  'meal-calendar': () => {
    const lit = []
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if ((r + c) % 2 === 0) lit.push(rectU(3.1, 138.8 + c * 3.8, 141.4 + c * 3.8, 83 + r * 8, 88 + r * 8, c === 1 ? LIME : NEON, { stroke: null, op: 0.9 }))
    return cat(
      box(0, 136, 3, 16, 76, 114, GUN_DK),
      rectU(3.05, 138, 150, 82, 108, SCREEN, { stroke: null }),
      isoLines([[P(3.08, 142.5, 82), P(3.08, 142.5, 108)], [P(3.08, 147, 82), P(3.08, 147, 108)], [P(3.08, 138, 90), P(3.08, 150, 90)], [P(3.08, 138, 99), P(3.08, 150, 99)]], 0.8, '#2f4a5c'),
      ...lit,
      ledOn(3.1, 144, 111, AMBER)
    )
  },
  // a work lamp on a bracket: a cone shade over a buzzing bulb (animated, glowing)
  'wall-sconce': () =>
    cat(
      rectU(0, 140.5, 147.5, 84, 98, GUN_DK),
      box(0, 142.5, 5, 3, 88, 91, GUN),
      cylE(5, 144, 2.2, 2.2, 91, 99, STEEL, 4.2, 4.2),
      fxg('buzz', glowG('#bff6ff', bill(5, 144, 99.5, <circle r="3.2" fill="#eafcff" stroke="#9fe8f5" strokeWidth="1" />), 4))
    ),
  // three mini monitors, each running a trace with a scan sweep (animated)
  // raised 12 so the bottom frame clears the windowsill (2026-11-17, mockup pip-dragon-shoes.html option C)
  'photo-strip': () =>
    cat(
      ...[[76, NEON], [94, LIME], [112, PINK]].map(([h, c]) =>
        cat(
          box(0, 137, 1.6, 14, h, h + 14, GUN_DK),
          rectU(1.75, 139, 149, h + 2, h + 12, SCREEN, { stroke: null }),
          traceU(1.8, [[140, h + 4], [142, h + 8], [144, h + 5], [146, h + 9], [148, h + 6]], c, 1),
          scanU(1.8, 139, 149, h + 2, h + 12)
        )
      )
    ),

  /* ---------- front right wall (right wall; legacy ids drawn at v 34-80, h 138-178) ---------- */
  // a digital clock panel: a dark plate with seven-segment digits and a blinking colon (animated)
  'wall-clock': () =>
    bill(
      0,
      57,
      158,
      <>
        <rect x="-15" y="-8.5" width="30" height="17" rx="2.5" fill={SCREEN} stroke={ROBOT_INK} strokeWidth="1.8" />
        <rect x="-13.4" y="-7" width="26.8" height="14" rx="1.6" fill="none" stroke={GUN_LT} strokeWidth="1" />
        {glowG(
          NEON,
          <>
            {digit7(1, -12, -3.5)}
            {digit7(2, -6, -3.5)}
            {fxg(
              'blink',
              <>
                <circle cx="0" cy="-1.6" r=".9" fill={NEON} />
                <circle cx="0" cy="1.6" r=".9" fill={NEON} />
              </>
            )}
            {digit7(0, 3, -3.5)}
            {digit7(8, 9, -3.5)}
          </>,
          2
        )}
      </>
    ),
  // pennant lights: five lit pennants on a cable, every other one blinking (animated)
  bunting: () =>
    cat(
      isoLine([P(0, 34, 172), P(0, 80, 172)], 2.4, CABLE_DK),
      ...[PINK, NEON, LIME, AMBER, PINK].map((c, i) => {
        const v = 36 + i * 9
        const p = poly([P(0, v, 171), P(0, v + 8, 171), P(0, v + 8, 159), P(0, v + 4, 163.5), P(0, v, 159)], c, { sw: 1.2 })
        return i % 2 ? fxg('blink', p, i * 0.4) : p
      })
    ),
  // a tool rail: a steel rail with a wrench, a screwdriver and pliers hanging from it
  'pan-rail': () =>
    cat(
      isoLine([P(0, 36, 170), P(0, 78, 170)], 2.6, STEEL_DK),
      bill(
        0,
        44,
        170,
        <>
          <path d="M0 0 V4" stroke={ROBOT_INK} strokeWidth="1.4" />
          <rect x="-1.8" y="4" width="3.6" height="13" rx="1.5" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.3" />
          <circle cy="19" r="4.2" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.3" />
          <rect x="-1.5" y="15.5" width="3" height="5" fill={SCREEN} />
        </>
      ),
      bill(
        0,
        57,
        170,
        <>
          <path d="M0 0 V3" stroke={ROBOT_INK} strokeWidth="1.4" />
          <rect x="-2.6" y="3" width="5.2" height="8" rx="2" fill={AMBER} stroke={ROBOT_INK} strokeWidth="1.3" />
          <rect x="-.9" y="11" width="1.8" height="11" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1" />
        </>
      ),
      bill(
        0,
        70,
        170,
        <>
          <path d="M0 0 V3" stroke={ROBOT_INK} strokeWidth="1.4" />
          {limb('M-1 4 L-4 16 M1 4 L4 16', 2.2, PINK)}
          <path d="M-4 16 l1.6 6 M4 16 l-1.6 6" stroke={STEEL} strokeWidth="2.2" strokeLinecap="round" />
        </>
      )
    ),
  // a round monitor: a bezel round a radar screen, a sweep line and blips (animated)
  mirror: () =>
    bill(
      0,
      57,
      158,
      <>
        <circle r="16" fill={GUN} stroke={ROBOT_INK} strokeWidth="2.2" />
        <circle r="12.6" fill={SCREEN} stroke={GUN_DK} strokeWidth="1.2" />
        {glowG(
          NEON,
          <>
            <circle r="10.4" fill="none" stroke={NEON} strokeWidth=".8" />
            <circle r="5.2" fill="none" stroke={NEON} strokeWidth=".6" opacity=".7" />
            <path d="M-10.4 0H10.4M0 -10.4V10.4" stroke={NEON} strokeWidth=".5" opacity=".5" />
          </>,
          2
        )}
        <circle cx="4.4" cy="-4.8" r="1.3" fill={LIME} />
        <circle cx="-5.6" cy="3.6" r="1.1" fill={PINK} />
        {fxg('scan', <path d="M-9 5 H9" stroke={NEON} strokeWidth="1.5" opacity=".6" strokeLinecap="round" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={(14.4 * Math.cos((i / 6) * Math.PI * 2)).toFixed(1)} cy={(14.4 * Math.sin((i / 6) * Math.PI * 2)).toFixed(1)} r=".9" fill={STEEL} />
        ))}
      </>
    ),
  // gear hooks: a plank with pegs, a hi-vis vest, a hard hat and a cable coil hanging from it
  'coat-hooks': () =>
    cat(
      box(0, 252, 2, 42, 121, 128, GUN),
      isoLine([P(2.1, 253, 127), P(2.1, 293, 127)], 1, HI),
      ...[260, 273, 286].map((v) => box(2, v - 0.8, 2, 1.6, 124, 126.5, STEEL_DK)),
      slabU(2, 0.9, [[256, 124], [266, 124], [268, 99], [254, 99]], HAZ),
      isoLines([[P(2.95, 258, 118), P(2.95, 258, 100)], [P(2.95, 262, 118), P(2.95, 262, 100)]], 1.4, HAZ_DK, 0.9),
      isoLine([P(3, 273, 119), P(3.4, 273, 114)], 1.2, ROBOT_INK),
      hat(3.4, 273, 103, 0.75),
      ellU(2, 286, 108, 5.4, 7, CABLE_DK, { sw: 1.2 }),
      ellU(2.1, 286, 108, 3.2, 4.2, 'none', { stroke: NEON, sw: 1 }),
      isoLine([P(2, 286, 124), P(2.2, 286, 115)], 1.2, ROBOT_INK)
    )
}
