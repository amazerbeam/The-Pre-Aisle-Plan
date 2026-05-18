import './PullToDismissUI.css'

/**
 * Visual UI for pull-to-dismiss gesture.
 * Shows an X target and a circle that follows the user's finger.
 */
function PullToDismissUI({ isDragging, circlePosition, isOverTarget, targetPosition, dragDirection }) {
  if (!isDragging) return null

  return (
    <div className="pull-to-dismiss-ui">
      {/* X Target */}
      <div
        className={`dismiss-target ${isOverTarget ? 'active' : ''} ${dragDirection}`}
        style={{
          left: targetPosition.x,
          top: targetPosition.y
        }}
      >
        <span className="dismiss-x">&times;</span>
      </div>

      {/* Circle following finger */}
      <div
        className={`dismiss-circle ${isOverTarget ? 'over-target' : ''}`}
        style={{
          left: circlePosition.x,
          top: circlePosition.y
        }}
      />
    </div>
  )
}

export default PullToDismissUI
