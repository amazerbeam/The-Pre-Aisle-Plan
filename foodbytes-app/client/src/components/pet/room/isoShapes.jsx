import { ROOM_INK } from '../../../constants/petRoom'
import {
  P,
  boxFaces,
  cylinderSidePoints,
  ellipsePoints,
  pts,
  rectHPoints,
  rectUPoints,
  rectVPoints,
  shade
} from './iso'

/**
 * MPP-16 AC 2: the mockup's box / cyl / ellH / rectU / rectV / rectH / bill as JSX.
 * Extra props (stroke, strokeWidth, strokeDasharray) override the default outline,
 * exactly as the mockup's `extra` string did.
 */
const EDGE = { stroke: ROOM_INK, strokeWidth: 1.6, strokeLinejoin: 'round' }

export function Poly({ points, fill, ...rest }) {
  return <polygon points={pts(points)} fill={fill} {...EDGE} {...rest} />
}

export function IsoLine({ points, width = 1.6, color = ROOM_INK }) {
  return <polyline points={pts(points)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
}

/** Solid box: the two visible sides, then the top. */
export function Box({ u, v, du, dv, h0, h1, color }) {
  const faces = boxFaces(u, v, du, dv, h0, h1)
  return (
    <>
      <Poly points={faces.front} fill={shade(color, -6)} />
      <Poly points={faces.side} fill={shade(color, -20)} />
      <Poly points={faces.top} fill={shade(color, 14)} />
    </>
  )
}

export function RectV({ vp, u0, u1, h0, h1, ...rest }) {
  return <Poly points={rectVPoints(vp, u0, u1, h0, h1)} {...rest} />
}

export function RectU({ up, v0, v1, h0, h1, ...rest }) {
  return <Poly points={rectUPoints(up, v0, v1, h0, h1)} {...rest} />
}

export function RectH({ h, u0, u1, v0, v1, ...rest }) {
  return <Poly points={rectHPoints(h, u0, u1, v0, v1)} {...rest} />
}

export function EllH({ cu, cv, h, ru, rv, ...rest }) {
  return <Poly points={ellipsePoints(cu, cv, h, ru, rv)} {...rest} />
}

/** Short cylinder (pots): side band, then the lid. */
export function Cyl({ cu, cv, r, h0, h1, color }) {
  return (
    <>
      <Poly points={cylinderSidePoints(cu, cv, r, h0, h1)} fill={shade(color, -12)} />
      <EllH cu={cu} cv={cv} h={h1} ru={r} rv={r} fill={shade(color, 12)} />
    </>
  )
}

/** Billboard: flat art (trophies, knobs, the sun) pinned to a floor point. */
export function Bill({ u, v, h = 0, children }) {
  const [x, y] = P(u, v, h)
  return <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>{children}</g>
}
