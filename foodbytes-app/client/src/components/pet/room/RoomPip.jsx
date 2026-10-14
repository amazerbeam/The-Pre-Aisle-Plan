import { PIP_DEFAULT_FORM } from '../../../constants/pipGrowth'
import { HERB_FOOT_X, HERB_FOOT_Y } from '../herb/herbForms'
import PipHerbFigure from '../herb/PipHerbFigure'
import { P } from './iso'
import PipHeadBar from './PipHeadBar'
import '../herb/PipHerb.css'

const DEFAULT_HERB = { form: PIP_DEFAULT_FORM, wilted: false, phase: null, outfit: null }

/**
 * MPP-16 AC 5 / MPP-17 / MPP-31: Pip at a pose from roomLayout.pipPose — on the rug in his
 * mood, happy at the cooker, or asleep in bed — drawn as his current herb form. `herb`
 * ({ form, wilted, phase }) comes from usePipGrowth. Every form has feet on HERB_FOOT_Y, so
 * the pose anchors (cooker walk, bed) are unchanged.
 * MPP-32: `herb.outfit` dresses him (PetView passes the wardrobe's outfit).
 * MPP-38: `levelBar` ({ pct, phase }) draws the small bar over his head — inside this transform,
 * outside the figure's .pip-anim, so it follows every pose and walk but not the bob.
 */
function RoomPip({ pose, herb = DEFAULT_HERB, levelBar = null }) {
  const { face, showProps, anchor, scale, dropPx } = pose
  const [x, y] = P(...anchor)
  const transform = `translate(${(x - HERB_FOOT_X * scale).toFixed(1)},${(y + dropPx - HERB_FOOT_Y * scale).toFixed(1)}) scale(${scale})`

  return (
    <g transform={transform}>
      <PipHerbFigure form={herb.form} mood={face} wilted={herb.wilted} phase={herb.phase} showProps={showProps} outfit={herb.outfit} />
      {levelBar && (
        <PipHeadBar form={herb.form} outfit={herb.outfit} pct={levelBar.pct} phase={levelBar.phase} poseScale={scale} />
      )}
    </g>
  )
}

export default RoomPip
