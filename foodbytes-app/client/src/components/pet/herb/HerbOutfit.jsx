import { createElement } from 'react'

/** MPP-32: draws wardrobeArt shape descriptors ({ tag, ...SVG attributes }) as SVG elements. */
export function OutfitShapes({ shapes }) {
  return shapes.map(({ tag, ...attrs }, i) => createElement(tag, { key: i, ...attrs }))
}

export default OutfitShapes
