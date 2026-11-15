import { createElement } from 'react'

/** Draws wardrobe shape descriptors ({ tag, ...SVG attributes }); a 'g' descriptor nests its `children` (animated parts). */
export function PipOutfit({ shapes }) {
  return shapes.map(({ tag, children, ...attrs }, i) =>
    createElement(tag, { key: i, ...attrs }, children ? <PipOutfit shapes={children} /> : undefined))
}

export default PipOutfit
