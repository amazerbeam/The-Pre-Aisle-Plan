import { spokenLevelLabel } from '../herb/headBar'
import './PipHeadBar.css'

/**
 * MPP-38 AC 6: the growth progressbar for screen readers. The room <svg> is role="img", which
 * makes anything inside it presentational, so this lives beside the SVG, visually hidden.
 */
function PipHeadBarStatus({ levelBar }) {
  return (
    <div
      className="pip-head-bar-status"
      role="progressbar"
      aria-label="Growth"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={levelBar.pct}
      aria-valuetext={spokenLevelLabel(levelBar.label)}
    />
  )
}

export default PipHeadBarStatus
