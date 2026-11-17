import { useId } from 'react'
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe'
import { HerbProps } from '../herb/herbParts'
import { lineArt } from './lineArt'
import { pipForm } from './lineForms'
import { PIP_FOOT_Y } from './pipSpace'
import PipOutfit from './PipOutfit'
import { CROWN_UNDER } from './wardrobeArt'
import { dressLayers } from './wardrobeLayers'

/**
 * One form of one Pip line at a mood, as an SVG <g> in the 200-unit space with its feet at
 * (100, PIP_FOOT_Y) — Pip wraps it in an <svg>, RoomPip places it in the room. The line's art
 * (lineArt) supplies the parts; this component owns the layer order the wardrobe check pins:
 * shadow → back → back-wear (a cape) → limbs (arms + legs) → body + shine → details → torso clip →
 * outline → extras → feet (bare ball feet, or the shoe that replaces them) → face (skipped while a screen-face item is worn; one eye dropped under a scar) → glasses (a screen
 * face is clipped to the glass; on a line with a screen, face + glasses change channel when the face swaps) →
 * crown when it tucks under the hat → hat → crown otherwise (skipped while an antenna is worn).
 * `wilted` droops and desaturates; `phase` drives the evolve pulse; `still` stops the idle
 * animation (Dress Pip cards and lineup).
 */
function PipFigure({ line, form, mood, wilted = false, phase = null, showProps = false, outfit = null, still = false }) {
  const id = `pip-figure-${useId().replace(/:/g, '')}`
  const clipId = `${id}-body`
  const screenClipId = `${id}-screen`
  const f = pipForm(line, form)
  const art = lineArt(line)
  const droop = wilted || mood === PET_MOODS.BORED || mood === PET_SLEEP_FACE
  const dress = dressLayers(outfit, line, form, { asleep: mood === PET_SLEEP_FACE, droop })
  const faceKey = dress.replacesFace ? outfit[WARDROBE_SLOT.GLASSES] : 'base' // a new key remounts the face: the channel change plays
  const sc = dress.screen
  const k = f.scale
  const shineX = 100 - f.side * 0.55
  const shineY = f.hat.y + 10
  const className = [
    'pip-herb-figure',
    `pip-mood-${mood}`,
    wilted && 'is-wilted',
    still && 'is-still',
    phase === PIP_GROWTH_PHASES.EVOLVING && 'is-evolving'
  ].filter(Boolean).join(' ')

  const faceLayer = (
    <>
      {!dress.replacesFace && <art.Face form={form} mood={mood} hideEye={dress.hideEye} />}
      {sc ? <g clipPath={`url(#${screenClipId})`}><PipOutfit shapes={dress.glasses} /></g> : <PipOutfit shapes={dress.glasses} />}
    </>
  )

  return (
    <g className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.fill[0]} />
          <stop offset="1" stopColor={f.fill[1]} />
        </linearGradient>
        <clipPath id={clipId}><path d={f.body} /></clipPath>
        {sc && <clipPath id={screenClipId}><rect x={sc.x + 2} y={sc.y + 2} width={sc.w - 4} height={sc.h - 4} rx={sc.r - 2} /></clipPath>}
      </defs>
      <ellipse cx="100" cy="189" rx={56 * k} ry="6" fill="rgba(40,60,20,.13)" />
      <g className="pip-anim">
        <g transform={`translate(100 ${PIP_FOOT_Y}) scale(${k}) translate(-100 -${PIP_FOOT_Y})`}>
          <art.Back form={form} droop={droop} />
          <PipOutfit shapes={dress.back} />
          <art.Limbs form={form} f={f} droop={droop} />
          <path d={f.body} fill={`url(#${id})`} />
          <ellipse cx={shineX} cy={shineY} rx="11" ry="6" transform={`rotate(-32 ${shineX} ${shineY})`} fill="#fff" opacity=".45" />
          <art.Details form={form} f={f} />
          {dress.clip.length > 0 && <g clipPath={`url(#${clipId})`}><PipOutfit shapes={dress.clip} /></g>}
          <path d={f.body} fill="none" stroke={art.ink} strokeWidth="5" strokeLinejoin="round" />
          <PipOutfit shapes={dress.extra} />
          <PipOutfit shapes={dress.feet} />
          {f.screen ? (
            <g key={faceKey} className="pip-fx pip-fx--tune">{faceLayer}</g>
          ) : faceLayer}
          {dress.crown === CROWN_UNDER && <art.Crown form={form} droop={droop} base={dress.growTop} />}
          {dress.hat && <g transform={dress.hat.transform ?? undefined}><PipOutfit shapes={dress.hat.shapes} /></g>}
          {!dress.replacesCrown && dress.crown !== CROWN_UNDER && <art.Crown form={form} droop={droop} base={dress.growTop} />}
        </g>
      </g>
      {showProps && <HerbProps mood={mood} ink={art.ink} />}
    </g>
  )
}

export default PipFigure
