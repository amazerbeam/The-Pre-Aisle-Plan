import { useRef } from 'react'
import { THEMES } from '../../constants/themes'
import { useTheme } from '../../contexts/ThemeContext'
import './ThemePicker.css'

const ARROW_STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/** Radiogroup of preview tiles, one per registry theme. Arrow keys move and select. */
function ThemePicker() {
  const { themeId, setTheme } = useTheme()
  const tileRefs = useRef([])

  const handleKeyDown = (e, index) => {
    const step = ARROW_STEPS[e.key]
    if (!step) return
    e.preventDefault()
    const next = (index + step + THEMES.length) % THEMES.length
    setTheme(THEMES[next].id)
    tileRefs.current[next]?.focus()
  }

  return (
    <div className="theme-picker" role="radiogroup" aria-label="Theme">
      {THEMES.map((t, index) => {
        const selected = t.id === themeId
        return (
          <button
            key={t.id}
            ref={(el) => { tileRefs.current[index] = el }}
            type="button"
            role="radio"
            className="theme-tile"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => setTheme(t.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className={`theme-preview theme-preview--${t.id}`} aria-hidden="true">
              <span className="theme-preview__bar">
                <span className="theme-preview__dot" />
                <span className="theme-preview__line" />
              </span>
              <span className="theme-preview__ticker" />
              <span className="theme-preview__cards">
                <span className="theme-preview__card" />
                <span className="theme-preview__card" />
              </span>
            </span>
            <span className="theme-tile__name">
              {t.label}
              <span className="theme-tile__tick" aria-hidden="true">✓</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemePicker
