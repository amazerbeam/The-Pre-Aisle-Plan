import { useEffect, useRef, useState } from 'react'
import petService from '../services/petService'
import { DECOR_SAVE_ERROR } from '../constants/petDecor'
import { withPlacement } from '../utils/roomPlacements'

/**
 * MPP-27 AC 3: ✏️ Edit room. Placing is free and undoable, so it is optimistic like the wardrobe
 * (MPP-32): the room changes at once (setRoom), the server's RoomWriteDTO replaces it
 * (applyRoomWrite), and a failure rolls back to the last server room with an error line. Only the
 * newest write's outcome is applied, so a slow earlier response can't undo a later tap. Writes are
 * never aborted, and there are no timers. Style chips use place() too (a finish is a spot).
 *
 * @param {{ room: Object|null, setRoom: (room: Object) => void, applyRoomWrite: (w: Object) => void }} input
 * @returns {{ editing: boolean, toggle: () => void, done: () => void, selectedSpot: string|null,
 *   openSpot: (spot: string) => void, closeSpot: () => void,
 *   place: (spot: string, itemId: string|null) => void, error: string|null }}
 */
export function useRoomEdit({ room, setRoom, applyRoomWrite }) {
  const [editing, setEditing] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [error, setError] = useState(null)
  const seqRef = useRef(0)
  const pendingRef = useRef(0)
  const serverRef = useRef(room)

  // Between writes, the context's copy is the server's.
  useEffect(() => {
    if (pendingRef.current === 0) serverRef.current = room
  }, [room])

  const place = (spot, itemId) => {
    if (!room) return
    const seq = ++seqRef.current
    pendingRef.current += 1
    setError(null)
    setRoom(withPlacement(room, spot, itemId))
    petService.placeDecor(spot, itemId)
      .then(write => {
        serverRef.current = write.room
        if (seq === seqRef.current) applyRoomWrite(write)
      })
      .catch(err => {
        if (seq !== seqRef.current) return
        setRoom(serverRef.current)
        setError(err.response?.data?.error || DECOR_SAVE_ERROR)
      })
      .finally(() => {
        pendingRef.current -= 1
      })
  }

  const done = () => {
    setEditing(false)
    setSelectedSpot(null)
    setError(null)
  }

  return {
    editing,
    toggle: () => (editing ? done() : setEditing(true)),
    done,
    selectedSpot,
    openSpot: setSelectedSpot,
    closeSpot: () => setSelectedSpot(null),
    place,
    error
  }
}

export default useRoomEdit
