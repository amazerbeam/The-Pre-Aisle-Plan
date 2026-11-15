import { PIXEL_ICONS } from '../../constants/pixelIcons'
import './PixelIcon.css'

/** Splits each grid row into runs of one symbol: [{ x, y, width, symbol }]. Same algorithm as the mockup's pxi(). */
function toRuns(rows) {
  const runs = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const symbol = row[x]
      if (symbol === '.') { x += 1; continue }
      let end = x
      while (row[end + 1] === symbol) end += 1
      runs.push({ x, y, width: end - x + 1, symbol })
      x = end + 1
    }
  })
  return runs
}

// Precomputed once at module load, so rendering an icon is just mapping a list.
const RUNS = Object.fromEntries(
  Object.entries(PIXEL_ICONS).map(([name, { rows, accents }]) => {
    const w = Math.max(...rows.map((r) => r.length))
    return [name, { runs: toRuns(rows), accents, viewBox: `-0.5 -0.5 ${w + 1} ${rows.length + 1}` }]
  }),
)

/** Cyberpunk pixel icon (menu, cal, cart). Decorative: the button around it carries the label. */
function PixelIcon({ name, size = 20, className }) {
  const { runs, accents, viewBox } = RUNS[name]
  return (
    <svg className={`pixel-icon ${className ?? ''}`} viewBox={viewBox} width={size} height={size}
         shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {runs.map(({ x, y, width, symbol }) => (
        symbol === '#'
          ? <rect key={`${x}-${y}`} x={x} y={y} width={width} height="1" fill="currentColor" />
          : <rect key={`${x}-${y}`} x={x} y={y} width={width} height="1" style={{ fill: accents[symbol] }} />
      ))}
    </svg>
  )
}

export default PixelIcon
