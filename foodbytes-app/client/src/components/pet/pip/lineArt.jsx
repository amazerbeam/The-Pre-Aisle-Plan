import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines'
import { DRAGON_ART } from '../dragon/dragonArt'
import { HERB_ART } from '../herb/herbArt'
import { ROBOT_ART } from '../robot/robotArt'

/**
 * Art per Pip line for PipFigure: { ink, Back({form, droop}), Limbs({form, f, droop}), Details({form, f}),
 * Face({form, mood}), Crown({form, droop, base}) }. Crown is what rises above the head and pokes
 * through a hat (basil growth, horns, antenna); `base` is where it starts after any hat.
 */
export const LINE_ART = {
  [PIP_LINE.HERB]: HERB_ART,
  [PIP_LINE.DRAGON]: DRAGON_ART,
  [PIP_LINE.ROBOT]: ROBOT_ART
}

export const lineArt = (line) => LINE_ART[line] ?? LINE_ART[PIP_DEFAULT_LINE]
