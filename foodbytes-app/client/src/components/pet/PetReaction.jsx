import { usePet } from '../../contexts/PetContext'
import { petReactionText } from '../../utils/petMood'
import { PET_MOODS } from '../../constants/pet'
import MochiPet from './MochiPet'
import './PetReaction.css'

/**
 * MPP-14 AC 7: "Pip is happy! Lunch logged." under the eaten button. Renders nothing
 * until the pet has loaded, so a failed pet load never shows a made-up name.
 */
function PetReaction({ mealType }) {
  const { petName } = usePet()
  if (!petName) return null

  return (
    <p className="pet-react">
      <MochiPet mood={PET_MOODS.HAPPY} variant="mini" />
      <span>{petReactionText({ petName, mealType })}</span>
    </p>
  )
}

export default PetReaction
