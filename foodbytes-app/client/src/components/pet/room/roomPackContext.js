import { createContext, useContext } from 'react'
import { HERB_ROOM } from './herbRoom'

/** MPP-45: the active room pack, provided by PetRoom from theme.pipLine. Defaults to herb so a lone thumbnail still draws. */
export const RoomPackContext = createContext(HERB_ROOM)
export const useRoomPack = () => useContext(RoomPackContext)
