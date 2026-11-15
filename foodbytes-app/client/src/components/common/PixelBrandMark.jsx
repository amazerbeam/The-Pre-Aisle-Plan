/**
 * Cyberpunk theme logo (the pixel ramen bowl), approved 2026-11-14. Same props and a11y as
 * BrandMark: decorative by default, pass `title` when the mark is the only label.
 * The installed-app icons (favicon, PWA icons) deliberately stay on the Default BrandMark.
 * The hex colours below are intentional: this is fixed, palette-locked brand art (mockup parity),
 * so it does not read theme tokens.
 */
const row = (color, cells) => cells.map(([x, y, w = 1]) => [color, x, y, w])

// [color, x, y, width] — one pixel-high run per entry, on a 16x16 grid.
const LOGO_PIXELS = [
  ...row('#05d9e8', [[4, 1], [3, 2], [4, 3], [3, 4], [7, 2], [6, 3], [7, 4]]),
  ...row('#f9f002', [[13, 1], [12, 2], [11, 3], [10, 4], [9, 5], [8, 6], [14, 2], [13, 3], [12, 4], [11, 5], [10, 6], [3, 7, 10]]),
  ...row('#ff2a6d', [[1, 8, 14], [2, 9, 12], [2, 10, 12], [3, 11, 10], [4, 12, 8]]),
  ...row('#ff8fb3', [[2, 8, 3]]),
  ...row('#a3123f', [[6, 13, 4]]),
]

function PixelBrandMark({ size = 40, title, className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges"
         role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <rect width="16" height="16" fill="#05070b" />
      {LOGO_PIXELS.map(([fill, x, y, w]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height="1" fill={fill} />
      ))}
    </svg>
  )
}

export default PixelBrandMark
