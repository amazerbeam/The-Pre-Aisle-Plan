import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePet } from '../../contexts/PetContext'
import MochiPet from './MochiPet'
import PetMealsCard from './PetMealsCard'
import PetNameEditor from './PetNameEditor'
import { PET_GUEST_MESSAGE } from '../../constants/pet'
import { petBubble, petChipLabel } from '../../utils/petMood'
import './PetView.css'

/**
 * MPP-14 AC 4: the Pet page — Mochi in its room, a speech bubble, the name, a mood
 * chip and today's meals. Guests get the sign-in prompt (AC 3) if they reach /pet
 * directly; the footer already stops them with a message.
 */
function PetView() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { pet, mood, moodInfo, error, retry, renamePet } = usePet()

  if (!isAuthenticated) {
    return (
      <div className="pet-view-state">
        <h2>{PET_GUEST_MESSAGE}</h2>
        <button type="button" className="pet-view-state-btn" onClick={() => navigate('/')}>
          Go to Recipes
        </button>
      </div>
    )
  }

  // A refetch error with a pet already loaded keeps showing the last good pet.
  if (!pet && error) {
    return (
      <div className="pet-view-state" role="alert">
        <p>{error}</p>
        <button type="button" className="pet-view-state-btn" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="pet-view-state" aria-busy="true">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="pet-view">
      <div className="pet-room">
        <div className="pet-room-window" aria-hidden="true" />
        <div className="pet-room-shelf" aria-hidden="true" />
        <div className="pet-room-jar" aria-hidden="true" />
        <div className="pet-room-jar pet-room-jar--small" aria-hidden="true" />
        <p className="pet-bubble" aria-live="polite">{petBubble(moodInfo)}</p>
        <div className="pet-stage">
          <MochiPet mood={mood} />
        </div>
      </div>

      <div className="pet-meta">
        <PetNameEditor name={pet.name} onRename={renamePet} />
        <span className={`pet-chip pet-chip--${mood}`}>{petChipLabel(moodInfo)}</span>
      </div>

      <PetMealsCard slots={moodInfo.todaySlots} />
    </div>
  )
}

export default PetView
