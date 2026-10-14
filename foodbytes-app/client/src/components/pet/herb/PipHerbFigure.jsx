import { useId } from 'react'
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS, PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import { HerbFace } from './herbFaces'
import { HERB_FOOT_Y, HERB_INK, herbForm } from './herbForms'
import { HerbBack, HerbGrowth, HerbProps } from './herbParts'
import OutfitShapes from './HerbOutfit'
import { dressLayers } from './wardrobeLayers'

/**
 * MPP-31: one herb form at a mood, as an SVG <g> in the 200-unit space with its feet at
 * (100, HERB_FOOT_Y) — PipHerb wraps it in an <svg>, RoomPip places it in the room.
 * `wilted` droops the leaves and desaturates (AC 7); `phase` drives the evolve pulse and the
 * de-evolve shrink (AC 8). The pip-mood-* class drives the idle animation (PipHerb.css).
 * MPP-32: `outfit` ({ HAT: 'beanie', … }) is layered in AC 3's order from the form's anchors
 * (wardrobeLayers); glasses hide while asleep and head growth pokes through the hat. `still`
 * stops the idle animation (Dress Pip cards and lineup).
 */
function PipHerbFigure({ form, mood, wilted = false, phase = null, showProps = false, outfit = null, still = false }) {
  const id = `pip-herb-${useId().replace(/:/g, '')}`
  const clipId = `${id}-body`
  const f = herbForm(form)
  const droop = wilted || mood === PET_MOODS.BORED || mood === PET_SLEEP_FACE
  const dress = dressLayers(outfit, form, { asleep: mood === PET_SLEEP_FACE })
  const k = f.scale
  const shineX = 100 - f.side * 0.55
  const shineY = f.hat.y + 10
  const className = [
    'pip-herb-figure',
    `pip-mood-${mood}`,
    wilted && 'is-wilted',
    still && 'is-still',
    phase === PIP_GROWTH_PHASES.EVOLVING && 'is-evolving',
    phase === PIP_GROWTH_PHASES.SHRINKING && 'is-shrinking'
  ].filter(Boolean).join(' ')

  return (
    <g className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.fill[0]} />
          <stop offset="1" stopColor={f.fill[1]} />
        </linearGradient>
        <clipPath id={clipId}><path d={f.body} /></clipPath>
      </defs>
      <ellipse cx="100" cy="189" rx={56 * k} ry="6" fill="rgba(40,60,20,.13)" />
      <g className="pip-anim">
        <g transform={`translate(100 ${HERB_FOOT_Y}) scale(${k}) translate(-100 -${HERB_FOOT_Y})`}>
          <HerbBack form={form} droop={droop} />
          {f.feet.map(([root, tip]) => (
            <path key={tip[0]} d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1]}`}
              stroke={HERB_INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          ))}
          <OutfitShapes shapes={dress.shoes} />
          <path d={f.body} fill={`url(#${id})`} />
          <ellipse cx={shineX} cy={shineY} rx="11" ry="6" transform={`rotate(-32 ${shineX} ${shineY})`} fill="#fff" opacity=".45" />
          {form === PIP_FORMS.BASIL_SEED && (
            <path d="M90 118 l5 7 l5 -6 l5 7 l5 -6" stroke={HERB_INK} strokeWidth="3" fill="none" strokeLinejoin="round" opacity=".7" />
          )}
          {dress.clip.length > 0 && <g clipPath={`url(#${clipId})`}><OutfitShapes shapes={dress.clip} /></g>}
          <path d={f.body} fill="none" stroke={HERB_INK} strokeWidth="5" strokeLinejoin="round" />
          <OutfitShapes shapes={dress.extra} />
          <HerbFace form={form} mood={mood} />
          <OutfitShapes shapes={dress.glasses} />
          {dress.hat && <g transform={dress.hat.transform ?? undefined}><OutfitShapes shapes={dress.hat.shapes} /></g>}
          <HerbGrowth form={form} droop={droop} base={dress.growTop} />
        </g>
      </g>
      {showProps && <HerbProps mood={mood} />}
    </g>
  )
}

export default PipHerbFigure
