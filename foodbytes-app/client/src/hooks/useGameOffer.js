import { useEffect, useState } from 'react'

/**
 * MPP-49: Pip's "play a game" offer. Tapping Pip offers only when nothing above fridge / mood is
 * speaking (canOffer); if a cook line, announcement, growth line or check-in arrives, the offer drops.
 */
export default function useGameOffer({ canOffer }) {
  const [offering, setOffering] = useState(false)

  useEffect(() => {
    if (!canOffer) setOffering(false)
  }, [canOffer])

  return {
    offering: offering && canOffer,
    offer: () => { if (canOffer) setOffering(true) },
    dismissOffer: () => setOffering(false)
  }
}
