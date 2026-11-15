import { PIP_DEFAULT_FORM } from '../../../constants/pipGrowth'
import { PIP_DEFAULT_LINE } from '../../../constants/pipLines'
import { PIP_FOOT_X, PIP_FOOT_Y } from '../pip/pipSpace'
import PipFigure from '../pip/PipFigure'
import { P } from './iso'
import PipHeadBar from './PipHeadBar'
import '../pip/Pip.css'

const DEFAULT_HERB = { line: PIP_DEFAULT_LINE, form: PIP_DEFAULT_FORM, wilted: false, phase: null, outfit: null }

/**
 * MPP-16 AC 5 / MPP-17 / MPP-31: Pip at a pose from roomLayout.pipPose — on the rug in his
 * mood, happy at the cooker, or asleep in bed — drawn as his current form of the active line. `herb`
 * ({ line, form, wilted, phase }) comes from usePipGrowth. Every form has feet on PIP_FOOT_Y, so
 * the pose anchors (cooker walk, bed) are unchanged.
 * MPP-32: `herb.outfit` dresses him (PetView passes the wardrobe's outfit).
 * MPP-38: `levelBar` ({ pct, phase, gain }) draws the small bar over his head — inside this transform,
 * outside the figure's .pip-anim, so it follows every pose and walk but not the bob.
 */
function RoomPip({ pose, herb = DEFAULT_HERB, levelBar = null }) {
  const { face, showProps, anchor, scale, dropPx } = pose
  const [x, y] = P(...anchor)
  const transform = `translate(${(x - PIP_FOOT_X * scale).toFixed(1)},${(y + dropPx - PIP_FOOT_Y * scale).toFixed(1)}) scale(${scale})`

  return (
    <g transform={transform}>
      <PipFigure line={herb.line} form={herb.form} mood={face} wilted={herb.wilted} phase={herb.phase} showProps={showProps} outfit={herb.outfit} />
      {levelBar && (
        <PipHeadBar line={herb.line} form={herb.form} outfit={herb.outfit} pct={levelBar.pct} phase={levelBar.phase} gain={levelBar.gain} poseScale={scale} />
      )}
    </g>
  )
}

export default RoomPip
