import { ROOM_RECENTRE_LABEL } from '../../../constants/petRoom'

/** MPP-39 AC 18: floats the camera back to Pip — bottom right of the room, fixed to the screen. */
function RecentreButton({ onRecentre }) {
  return (
    <button type="button" className="pip-room-recentre" aria-label={ROOM_RECENTRE_LABEL} onClick={onRecentre}>
      <span aria-hidden="true">🎯</span>
    </button>
  )
}

export default RecentreButton
