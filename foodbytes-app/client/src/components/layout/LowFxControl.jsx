import { useTheme } from '../../contexts/ThemeContext'

/** Low FX switch row. Styles live in UserMenu.css; only shown for themes with effects. */
function LowFxControl() {
  const { lowFx, toggleLowFx } = useTheme()

  return (
    <div className="user-menu__row">
      <span id="lowfx-label">
        Low FX
        <small>No glow, rain or flicker</small>
      </span>
      <button
        type="button"
        className="lowfx-switch"
        role="switch"
        aria-checked={lowFx}
        aria-labelledby="lowfx-label"
        onClick={toggleLowFx}
      />
    </div>
  )
}

export default LowFxControl
