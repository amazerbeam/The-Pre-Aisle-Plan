import { useId } from 'react'
import { MochiBody, MochiFace, MochiGradient, MochiProps } from '../mochiParts'
import { P } from './iso'
import '../MochiPet.css'

// Pip is drawn in MochiPet's 200-unit space with his feet at (100, 188); the mockup's
// pipFace() maps that point onto the pose's anchor.
const FOOT_X = 100
const FOOT_Y = 188

/**
 * MPP-16 AC 5 / MPP-17: Pip at a pose from roomLayout.pipPose — on the rug in his mood,
 * happy at the cooker, or asleep in bed. The mochi-mood-* class drives the idle
 * animation; the sleep face has no rule in MochiPet.css, so he lies still.
 */
function RoomPip({ pose }) {
  // useId keeps the gradient id unique if MochiPet is also on screen.
  const gradientId = `room-pip-fill-${useId().replace(/:/g, '')}`
  const { face, showProps, anchor, scale, dropPx } = pose
  const [x, y] = P(...anchor)
  const transform = `translate(${(x - FOOT_X * scale).toFixed(1)},${(y + dropPx - FOOT_Y * scale).toFixed(1)}) scale(${scale})`

  return (
    <g transform={transform} className={`mochi-mood-${face}`}>
      <defs>
        <MochiGradient id={gradientId} />
      </defs>
      <ellipse cx="100" cy="190" rx="66" ry="8" fill="rgba(40,20,80,.13)" />
      <g className="mochi-anim">
        <MochiBody fill={`url(#${gradientId})`} />
        <MochiFace mood={face} />
      </g>
      {showProps && <MochiProps mood={face} />}
    </g>
  )
}

export default RoomPip
