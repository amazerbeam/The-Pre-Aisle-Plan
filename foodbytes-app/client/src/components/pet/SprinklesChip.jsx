import { SPARK_COUNT } from '../../constants/petSprinkles'
import { SPRINKLES_ICON } from '../../constants/petRoom'
import useCountUpNumber from '../../hooks/useCountUpNumber'
import './SprinklesChip.css'

// The sparkle burst's directions, around the chip (mockup: 26px across, 18px up/down).
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (i / SPARK_COUNT) * Math.PI * 2
  return { '--dx': `${Math.round(Math.cos(angle) * 26)}px`, '--dy': `${Math.round(Math.sin(angle) * 18)}px` }
})

/**
 * MPP-42 AC 15, 18, 19: Pip's header sprinkles. During a run it shows the old number, turns gold and
 * bumps, counts up, pops a "+N ✨" pill and a sparkle burst; reduced motion jumps to the new number
 * and holds the pill still. The aria-label is always the real balance; the polite live line is a
 * sibling, so it is read once.
 *
 * @param {{ sprinkles: number, earning: { run: Object|null, reduced: boolean, liveText: string|null } }} props
 */
function SprinklesChip({ sprinkles, earning }) {
  const { value, phase } = useCountUpNumber({ run: earning.run, reduced: earning.reduced })
  // run can clear a render before the hook's phase resets to idle, so require it here.
  const showing = Boolean(earning.run) && (phase === 'counting' || phase === 'done')
  const gold = showing && !earning.reduced

  return (
    <>
      <span className={`pip-header-sprinkles${gold ? ' is-earning' : ''}`} aria-label={`${sprinkles} sprinkles`}>
        <span aria-hidden="true">{SPRINKLES_ICON} {value ?? sprinkles}</span>
        {showing && (
          <span key={earning.run.id} className={`sprinkles-gain${earning.reduced ? ' is-still' : ' go'}`} aria-hidden="true">
            +{earning.run.gain} {SPRINKLES_ICON}
          </span>
        )}
        {gold && SPARKS.map((style, i) => (
          <span key={`${earning.run.id}-${i}`} className="sprinkles-spark go" style={style} aria-hidden="true">✨</span>
        ))}
      </span>
      <span className="sprinkles-live" role="status" aria-live="polite">{earning.liveText ?? ''}</span>
    </>
  )
}

export default SprinklesChip
