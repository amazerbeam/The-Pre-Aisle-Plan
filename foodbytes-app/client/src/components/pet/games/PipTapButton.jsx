import { hitBoxStyle } from '../room/roomLayout'

/** MPP-49: a real button laid over Pip's figure (like the room's StationButton); tapping it makes Pip offer a game. */
function PipTapButton({ box, label, buttonRef, onTap }) {
  return <button ref={buttonRef} type="button" className="pip-tap-btn" style={hitBoxStyle(box)} aria-label={label} onClick={onTap} />
}

export default PipTapButton
