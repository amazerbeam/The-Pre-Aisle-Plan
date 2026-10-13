import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePet } from '../../contexts/PetContext'
import PetRoom from './room/PetRoom'
import PetMealsCard from './PetMealsCard'
import PetNameEditor from './PetNameEditor'
import { PET_GUEST_MESSAGE } from '../../constants/pet'
import useCookAndServe from '../../hooks/useCookAndServe'
import { cookServeBubble } from '../../utils/cookServe'
import { fridgeBubble } from '../../utils/fridgeFill'
import { petBubble, petChipLabel } from '../../utils/petMood'
import './PetView.css'

/**
 * MPP-14 AC 4 / MPP-16 / MPP-17 / MPP-18: the Pet page — Pip in his room (rug, cooker or bed by
 * your meal times), a speech bubble, the name, a mood chip and today's meals. Guests get
 * the sign-in prompt (AC 3) if they reach /pet directly; the footer already stops them
 * with a message.
 * MPP-18: a newly eaten meal plays the cook-and-serve scene once (useCookAndServe).
 * MPP-19: the fridge (gauge + view) and, when idle with a low fridge, the low-stock bubble (cook > fridge-low > mood).
 */
function PetView() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { pet, mood, moodInfo, position, fridge, error, retry, renamePet } = usePet()
  // Before the early returns (rules of hooks); gated on a loaded pet via userId.
  const serving = useCookAndServe({
    userId: pet ? user?.id ?? null : null,
    lastLoggedAt: moodInfo.lastLoggedAt,
    lastLoggedType: moodInfo.lastLoggedType
  })

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
      <PetRoom
        name={pet.name}
        mood={mood}
        bubble={(serving && cookServeBubble(serving)) ?? fridgeBubble(fridge.fill, position) ?? petBubble(moodInfo)}
        position={position}
        serving={serving}
        fridge={fridge}
      />

      <div className="pet-meta">
        <PetNameEditor name={pet.name} onRename={renamePet} />
        <span className={`pet-chip pet-chip--${mood}`}>{petChipLabel(moodInfo)}</span>
      </div>

      <PetMealsCard slots={moodInfo.todaySlots} />
    </div>
  )
}

export default PetView
