import { P, rectHPoints } from './iso'
import { EllH, IsoLine, Poly, RectH } from './isoShapes'
import { Flat, WHITE_HI } from './decorArtWalls'
import { RUG } from './roomLayout'

/**
 * MPP-40: the six rugs (the pink rug is MPP-39's fixed rug, now the free default). Flat art at floor level,
 * centred on RUG.cu, RUG.cv so Pip still stands in the middle of whichever one is laid.
 */
const { cu, cv } = RUG
const RUG_RING = { ru: 40, rv: 30 }
const BRAID_RINGS = [[57, 43, '#c9965f'], [49, 37, '#e2b989'], [40, 30, '#a8744a'], [30, 22, '#e2b989'], [19, 14, '#c9965f']]
const STRIPE_COLOURS = ['#ff8fab', '#ffd34d', '#7cc35a', '#4dabf7', '#c9a6f7']
const LEAF_VEINS = [-0.35, 0.05, 0.4, 0.65]

// The basil-leaf rug's outline: a lens 112 long, k scales its width.
function lens(h, k) {
  const upper = Array.from({ length: 21 }, (_, i) => {
    const s = -1 + i / 10
    return P(cu + 56 * s, cv - 36 * (1 - s * s) * k, h)
  })
  const lower = Array.from({ length: 19 }, (_, i) => {
    const s = -1 + (19 - i) / 10
    return P(cu + 56 * s, cv + 36 * (1 - s * s) * k, h)
  })
  return [...upper, ...lower]
}

// The sheepskin's wobbly edge.
const wobble = (ru, rv, h) => Array.from({ length: 40 }, (_, i) => {
  const t = (i / 40) * Math.PI * 2
  const k = 1 + 0.07 * Math.sin(t * 9)
  return P(cu + ru * k * Math.cos(t), cv + rv * k * Math.sin(t), h)
})

function BraidedRug() {
  return (
    <>
      <EllH cu={cu} cv={cv} h={0} ru={58} rv={44} fill="#7a5230" />
      {BRAID_RINGS.map(([a, b, c]) => <EllH key={a} cu={cu} cv={cv} h={1.4} ru={a} rv={b} fill={c} />)}
      {Array.from({ length: 30 }, (_, i) => {
        const t = (i / 30) * Math.PI * 2
        return <IsoLine key={i} points={[P(cu + 49 * Math.cos(t), cv + 37 * Math.sin(t), 1.4), P(cu + 56.5 * Math.cos(t), cv + 42.5 * Math.sin(t), 1.4)]} width={1.1} color="#8a5a2b" />
      })}
      <IsoLine
        points={Array.from({ length: 10 }, (_, i) => {
          const t = Math.PI * (1.05 + i * 0.045)
          return P(cu + 53 * Math.cos(t), cv + 40 * Math.sin(t), 1.4)
        })}
        width={1.6}
        color={WHITE_HI}
      />
    </>
  )
}

function LeafRug() {
  return (
    <>
      <Poly points={lens(0, 1)} fill="#6fae52" />
      <Poly points={lens(1.4, 0.985)} fill="#a7d98a" />
      <IsoLine points={[P(cu - 55, cv, 1.4), P(cu + 55, cv, 1.4)]} width={2} color="#6fae52" />
      {LEAF_VEINS.map(s => (
        <g key={s}>
          <IsoLine points={[P(cu + 56 * s, cv, 1.4), P(cu + 56 * s - 14, cv - 22 * (1 - s * s), 1.4)]} width={1.5} color="#6fae52" />
          <IsoLine points={[P(cu + 56 * s, cv, 1.4), P(cu + 56 * s - 14, cv + 22 * (1 - s * s), 1.4)]} width={1.5} color="#6fae52" />
        </g>
      ))}
      <IsoLine points={[P(cu - 40, cv - 10, 1.4), P(cu - 20, cv - 16, 1.4), P(cu, cv - 19, 1.4)]} width={1.6} color={WHITE_HI} />
    </>
  )
}

function StripeRug() {
  return (
    <>
      <RectH h={0} u0={85} u1={197} v0={111} v1={189} fill="#9d8fc0" />
      {STRIPE_COLOURS.map((c, i) => <Flat key={c} points={rectHPoints(1.2, 86 + i * 22, 108 + i * 22, 112, 188)} fill={c} />)}
      <RectH h={1.2} u0={86} u1={196} v0={112} v1={188} fill="none" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <IsoLine points={[P(94 + i * 10, 112, 1), P(94 + i * 10, 109.5, 1)]} width={1.4} color="#fffaf0" />
          <IsoLine points={[P(94 + i * 10, 188, 1), P(94 + i * 10, 190.5, 1)]} width={1.4} color="#fffaf0" />
        </g>
      ))}
      <IsoLine points={[P(88, 113.4, 1.2), P(194, 113.4, 1.2)]} width={1.4} color={WHITE_HI} />
    </>
  )
}

function PicnicRug() {
  const checks = []
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      if ((a + b) % 2 === 0) checks.push(<Flat key={`${a}-${b}`} points={rectHPoints(1.2, 96 + a * 22, 118 + a * 22, 108 + b * 21, 129 + b * 21)} fill="#ef7d7d" />)
    }
  }
  return (
    <>
      <RectH h={0} u0={95} u1={185} v0={107} v1={193} fill="#c9b8b8" />
      <Flat points={rectHPoints(1.2, 96, 184, 108, 192)} fill="#ffffff" />
      {checks}
      <RectH h={1.2} u0={96} u1={184} v0={108} v1={192} fill="none" />
      <EllH cu={126} cv={140} h={1.5} ru={7} rv={6} fill="#ffffff" />
      <EllH cu={126} cv={140} h={1.7} ru={3.2} rv={3} fill="#e63946" />
      <IsoLine points={[P(126, 140, 1.7), P(127.5, 138, 1.7)]} width={1.2} color="#5fa84a" />
      <RectH h={1.5} u0={150} u1={160} v0={160} v1={170} fill="#4dabf7" />
      <IsoLine points={[P(150.8, 160.8, 1.5), P(159.2, 169.2, 1.5)]} width={1.1} color={WHITE_HI} />
    </>
  )
}

function SheepskinRug() {
  return (
    <>
      <Poly points={wobble(52, 40, 0)} fill="#d9cfbf" />
      <Poly points={wobble(51, 39, 1.4)} fill="#fbf7ef" />
      {Array.from({ length: 22 }, (_, i) => {
        const t = i * 2.4
        const r = 0.25 + (i % 5) * 0.14
        const x = cu + 40 * r * Math.cos(t) * 1.1
        const y = cv + 30 * r * Math.sin(t) * 1.1
        return <IsoLine key={i} points={[P(x - 3, y - 1.2, 1.4), P(x, y + 1.6, 1.4), P(x + 3, y - 0.8, 1.4)]} width={1.2} color="#ddd0bc" />
      })}
      <IsoLine
        points={Array.from({ length: 9 }, (_, i) => {
          const t = Math.PI * (1.1 + i * 0.05)
          return P(cu + 43 * Math.cos(t), cv + 32 * Math.sin(t), 1.4)
        })}
        width={1.6}
        color="#ffffff"
      />
    </>
  )
}

export const RUG_BUILDERS = {
  'rug-pink': () => (
    <>
      <EllH cu={cu} cv={cv} h={0} ru={RUG.ru} rv={RUG.rv} fill="#f6c6d6" stroke="#e79ab5" strokeWidth="3" />
      <EllH cu={cu} cv={cv} h={0} ru={RUG_RING.ru} rv={RUG_RING.rv} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 5" />
    </>
  ),
  'rug-braided': () => <BraidedRug />,
  'rug-leaf': () => <LeafRug />,
  'rug-stripe': () => <StripeRug />,
  'rug-picnic': () => <PicnicRug />,
  'rug-sheepskin': () => <SheepskinRug />
}
