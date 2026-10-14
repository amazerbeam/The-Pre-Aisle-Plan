import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePet } from '../../contexts/PetContext'
import PetRoom from './room/PetRoom'
import PipHeader from './PipHeader'
import CheckInActions from './room/CheckInActions'
import { PET_GUEST_MESSAGE } from '../../constants/pet'
import { PIP_FORM_NAMES, PIP_FORMS } from '../../constants/pipGrowth'
import useCookAndServe from '../../hooks/useCookAndServe'
import useHabitCheckIn from '../../hooks/useHabitCheckIn'
import usePetAwards from '../../hooks/usePetAwards'
import useRoomEdit from '../../hooks/useRoomEdit'
import usePipGrowth from '../../hooks/usePipGrowth'
import usePetShop from '../../hooks/usePetShop'
import usePipWardrobe from '../../hooks/usePipWardrobe'
import { cookServeBubble } from '../../utils/cookServe'
import { fridgeBubble } from '../../utils/fridgeFill'
import { petBubble, petChipLabel } from '../../utils/petMood'
import { pipBubble } from '../../utils/pipBubble'
import { isWilted } from '../../utils/pipGrowth'
import './PetView.css'

/**
 * MPP-14 AC 4 / MPP-16 / MPP-17 / MPP-18: the Pet page — Pip in his room (rug, cooker or bed by
 * your meal times), a speech bubble, and (MPP-37) a slim header with the name, form, sprinkles
 * and mood chip — full screen, no Today's meals. Guests get the sign-in prompt (AC 3) if they
 * reach /pet directly; the footer already stops them with a message.
 * MPP-18: a newly eaten meal plays the cook-and-serve scene once (useCookAndServe).
 * MPP-19: the fridge (gauge + view) and a low-stock bubble.
 * MPP-21: Pip's daily snack / alcohol check-in speaks in the bubble; the cook scene hides it without resetting it.
 * MPP-23: the trophy cabinet (usePetAwards) and Pip's "🎉 New …" line for a newly earned award.
 * MPP-31: Pip's herb form, level bar, wilt and the evolve / de-evolve sequence (usePipGrowth).
 * MPP-32: Pip's wardrobe — the outfit on his figure, the Wardrobe strip + Dress Pip sheet, and the "🎉 New outfit" line (usePipWardrobe).
 * MPP-28: one pet read (habits + cabinet ride in /pet); the bubble order lives in pipBubble.
 * MPP-26: the room draws your own station levels; the 🛍 Shop sheet upgrades them (usePetShop), and Pip says one line after an upgrade.
 * MPP-27: your own decor and wall / floor styles in the room; ✏️ Edit room places them (useRoomEdit), the shop's Decor and Walls & floors tabs buy them, and Pip says one line after a purchase.
 */
function PetView() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { pet, petDay, mood, moodInfo, position, fridge, todayISO, loading, error, retry, renamePet, setWardrobe, sprinkles, applyRoomWrite, refreshPet, setRoom } = usePet()
  // Before the early returns (rules of hooks); gated on a loaded pet via userId.
  const petUserId = pet ? user?.id ?? null : null
  const awards = usePetAwards({ userId: petUserId, awards: pet?.awards ?? null, loading, error, retry })
  const checkIn = useHabitCheckIn({ userId: petUserId, todayISO, habits: pet?.habits ?? null, petDay, onAnswered: refreshPet })
  const serving = useCookAndServe({
    userId: petUserId,
    lastLoggedAt: moodInfo.lastLoggedAt,
    lastLoggedType: moodInfo.lastLoggedType
  })
  const dressing = usePipWardrobe({ userId: petUserId, wardrobe: pet?.wardrobe ?? null, setWardrobe })
  const shopState = usePetShop({ applyRoomWrite, refreshPet })
  const roomEdit = useRoomEdit({ room: pet?.room ?? null, setRoom, applyRoomWrite })
  // MPP-28 AC 2: award > outfit > shop line; a stage change waits for these and for the cook scene.
  const announcement = awards.announcement ?? dressing.announcement ?? shopState.announcement
  const growth = usePipGrowth({ userId: petUserId, growth: pet?.growth ?? null, petName: pet?.name ?? null, hold: Boolean(serving) || Boolean(announcement) })

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

  // MPP-28 AC 2: cook > award/outfit > stage change > check-in > fridge-low > mood (pipBubble).
  const said = pipBubble({
    cookLine: serving ? cookServeBubble(serving) : null,
    announcement,
    growthLine: growth.bubble,
    checkIn,
    fridgeLine: fridgeBubble(fridge.fill, position),
    moodLine: petBubble(moodInfo)
  })
  const bubbleActions = said.actions ? <CheckInActions {...said.actions} /> : null
  const herb = { form: growth.displayForm, wilted: isWilted(pet.growth), phase: growth.phase, outfit: pet.wardrobe?.outfit ?? null }
  const wardrobe = pet.wardrobe
    ? { ...dressing, data: pet.wardrobe, peakForm: pet.growth?.peakForm ?? growth.displayForm }
    : null
  // MPP-26: the shop only once the room and balance have loaded — never a sheet of fake level-1 data.
  const shop = pet.room && typeof pet.sprinkles === 'number' ? { ...shopState, room: pet.room, sprinkles: pet.sprinkles } : null
  // MPP-27: edit mode only once the room has loaded — never a picker over a fake empty room.
  const decor = pet.room ? { ...roomEdit, room: pet.room } : null
  // MPP-38 AC 8: no bar once Pip is a Basilisk; during an evolve into it, Bushling's bar still fills and flashes first.
  const levelBar = growth.barLabel && growth.displayForm !== PIP_FORMS.BASILISK
    ? { label: growth.barLabel, pct: growth.barPct, phase: growth.phase }
    : null

  return (
    <div className="pet-view">
      <PipHeader
        name={pet.name}
        onRename={renamePet}
        formName={PIP_FORM_NAMES[growth.displayForm]}
        sprinkles={sprinkles}
        mood={mood}
        moodLabel={petChipLabel(moodInfo)}
      />
      <PetRoom
        name={pet.name}
        mood={mood}
        bubble={said.text}
        bubbleActions={bubbleActions}
        position={position}
        serving={serving}
        fridge={fridge}
        cabinet={awards.cabinet}
        herb={herb}
        levelBar={levelBar}
        wardrobe={wardrobe}
        levels={pet.room?.stations}
        shop={shop}
        decor={decor}
      />
    </div>
  )
}

export default PetView
