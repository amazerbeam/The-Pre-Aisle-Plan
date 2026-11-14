import { useEffect, useRef, useState } from 'react'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import { parseServings, formatServings, stepServings } from '../../utils/servingsUtils'
import './RecipeCard.css'

/** "👥 2 ▾" chip that opens a small − / input / + popover. Calls onChange with each valid value. */
function ServingsChip({ servings, onChange }) {
  const [open, setOpen] = useState(false)
  // Display buffer so a partially-typed value ("0.") doesn't clobber the numeric state
  const [display, setDisplay] = useState(() => formatServings(servings))
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const handleInput = (e) => {
    setDisplay(e.target.value)
    const parsed = parseServings(e.target.value)
    if (parsed !== null) onChange(parsed)
  }

  const handleBlur = () => setDisplay(formatServings(servings))

  const adjust = (delta) => {
    const next = stepServings(servings, delta)
    setDisplay(formatServings(next))
    onChange(next)
  }

  return (
    <div className="servings-chip" ref={wrapperRef}>
      <button
        type="button"
        className="servings-chip-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Servings: ${formatServings(servings)}`}
      >
        👥 {formatServings(servings)} ▾
      </button>
      {open && (
        <div className="servings-chip-popover" role="dialog" aria-label="Servings">
          <button
            type="button"
            className="servings-chip-step"
            onClick={() => adjust(-SERVINGS_STEP)}
            disabled={servings <= MIN_SERVINGS}
            aria-label="Decrease servings"
          >
            −
          </button>
          <input
            type="number"
            inputMode="decimal"
            min={MIN_SERVINGS}
            max={MAX_SERVINGS}
            step={SERVINGS_STEP}
            value={display}
            onChange={handleInput}
            onBlur={handleBlur}
            className="servings-chip-input"
            aria-label="Number of servings"
          />
          <button
            type="button"
            className="servings-chip-step"
            onClick={() => adjust(SERVINGS_STEP)}
            disabled={servings >= MAX_SERVINGS}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

export default ServingsChip
