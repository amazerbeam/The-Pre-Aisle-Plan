import { PIP_FORMS } from '../../../constants/pipGrowth'
import { HerbFace } from './herbFaces'
import { HERB_INK } from './herbForms'
import { HerbBack, HerbGrowth } from './herbParts'

/** The herb line's parts for PipFigure: stalk feet, the seed's zigzag, leaves behind and growth on top (MPP-31). */
function HerbLimbs({ f }) {
  return f.feet.map(([root, tip]) => (
    <path key={tip[0]} d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1]}`}
      stroke={HERB_INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
  ))
}

function HerbDetails({ form }) {
  if (form !== PIP_FORMS.BASIL_SEED) return null
  return <path d="M90 118 l5 7 l5 -6 l5 7 l5 -6" stroke={HERB_INK} strokeWidth="3" fill="none" strokeLinejoin="round" opacity=".7" />
}

export const HERB_ART = {
  ink: HERB_INK,
  Back: HerbBack,
  Limbs: HerbLimbs,
  Details: HerbDetails,
  Face: HerbFace,
  Crown: HerbGrowth
}
