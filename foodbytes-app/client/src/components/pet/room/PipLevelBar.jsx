import { PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import './PipLevelBar.css'

// The new form's bar jumps to its starting edge without animating backwards (AC 5).
const INSTANT_PHASES = [PIP_GROWTH_PHASES.EVOLVING, PIP_GROWTH_PHASES.SHRINKING]

/**
 * MPP-31 AC 5: the green level bar under Pip, e.g. "Seedling · 6 / 21 → Sprig" or "Fully grown 🌸".
 * Width changes animate (CSS transition) except when a new form's bar starts.
 */
function PipLevelBar({ label, pct, phase }) {
  const instant = INSTANT_PHASES.includes(phase)
  return (
    <div className="pip-level">
      <p className="pip-level-label" aria-hidden="true">{label}</p>
      <div
        className="pip-level-track"
        role="progressbar"
        aria-label="Growth"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={label}
      >
        <div className={instant ? 'pip-level-fill is-instant' : 'pip-level-fill'} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default PipLevelBar
