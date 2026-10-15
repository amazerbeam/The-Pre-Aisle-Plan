import { FREE_MODE_BADGE, FREE_MODE_BADGE_LABEL } from '../../../constants/petShop'
import './CheckInActions.css'

/** MPP-40: shown in the room's action strip while the server's pet free mode is on (testing), so it is never mistaken for the real shop. */
function FreeModeBadge() {
  return <span className="pip-free-mode-badge" role="status" aria-label={FREE_MODE_BADGE_LABEL}>{FREE_MODE_BADGE}</span>
}

export default FreeModeBadge
