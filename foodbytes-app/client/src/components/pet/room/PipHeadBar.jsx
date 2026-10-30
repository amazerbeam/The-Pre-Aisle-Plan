import {
  HEAD_BAR_FLASH_MS, HEAD_BAR_GAIN_DELTA_MS, HEAD_BAR_GAIN_MS, HEAD_BAR_HEIGHT, HEAD_BAR_WIDTH, PIP_GROWTH_PHASES
} from '../../../constants/pipGrowth'
import { HERB_FOOT_X } from '../herb/herbForms'
import { headBarY } from '../herb/headBar'
import './PipHeadBar.css'

// The new form's bar jumps to its starting edge without animating backwards (MPP-31 AC 5).
const INSTANT_PHASES = [PIP_GROWTH_PHASES.EVOLVING, PIP_GROWTH_PHASES.SHRINKING]

/**
 * MPP-38: the small level bar over Pip's head, drawn inside RoomPip so it follows every pose
 * and walk (AC 3). Sized in room units ÷ poseScale so it reads the same at the rug and in bed.
 * Decorative only — PipHeadBarStatus carries the progress for screen readers (AC 6).
 * `gain` (from usePipGrowth) floats "+3" up off the bar, then shows "3 / 15" and fades.
 */
function PipHeadBar({ form, outfit, pct, phase, gain = null, poseScale }) {
  const w = HEAD_BAR_WIDTH / poseScale
  const h = HEAD_BAR_HEIGHT / poseScale
  const className = [
    'pip-head-bar',
    INSTANT_PHASES.includes(phase) && 'is-instant',
    phase === PIP_GROWTH_PHASES.FILLING && 'is-full'
  ].filter(Boolean).join(' ')

  return (
    <g
      className={className}
      aria-hidden="true"
      transform={`translate(${(HERB_FOOT_X - w / 2).toFixed(1)} ${(headBarY(form, outfit) - h).toFixed(1)})`}
      style={{ '--pip-head-bar-flash': `${HEAD_BAR_FLASH_MS}ms` }}
    >
      <rect className="pip-head-bar-track" width={w} height={h} rx={h / 2} />
      <rect className="pip-head-bar-fill" width={w} height={h} rx={h / 2} style={{ transform: `scaleX(${pct / 100})` }} />
      <rect className="pip-head-bar-outline" width={w} height={h} rx={h / 2} strokeWidth={1.4 / poseScale} />
      {gain && (
        <g
          key={gain.id}
          className="pip-head-bar-gain"
          style={{
            '--pip-gain-delay': `${gain.delayMs}ms`,
            '--pip-gain-rise': `${-12 / poseScale}px`,
            '--pip-gain-ms': `${HEAD_BAR_GAIN_MS}ms`,
            '--pip-gain-delta-ms': `${HEAD_BAR_GAIN_DELTA_MS}ms`
          }}
        >
          <text
            className={`pip-head-bar-delta ${gain.gained ? 'is-up' : 'is-down'}`}
            x={w / 2} y={-3 / poseScale} fontSize={9 / poseScale} strokeWidth={2.4 / poseScale}
          >
            {gain.text}
          </text>
          <text className="pip-head-bar-count" x={w / 2} y={-3 / poseScale} fontSize={7 / poseScale} strokeWidth={2.4 / poseScale}>
            {gain.count}
          </text>
        </g>
      )}
    </g>
  )
}

export default PipHeadBar
