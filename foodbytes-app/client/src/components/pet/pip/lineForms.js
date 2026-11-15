import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines.js'
import { DRAGON_FORMS } from '../dragon/dragonForms.js'
import { HERB_FORMS } from '../herb/herbForms.js'
import { ROBOT_FORMS } from '../robot/robotForms.js'

/**
 * Geometry per Pip line (pure, so the node checks can import it). Each line's forms share the herb
 * keys: scale, fill, body, hat, eyes, neck, waist, side, feet, growTop, crownTop, growthRise,
 * miniViewBox. Adding a form = append to the line's *_FORMS (and its name + server threshold).
 */
export const LINE_FORMS = {
  [PIP_LINE.HERB]: HERB_FORMS,
  [PIP_LINE.DRAGON]: DRAGON_FORMS,
  [PIP_LINE.ROBOT]: ROBOT_FORMS
}

export const lineForms = (line) => LINE_FORMS[line] ?? LINE_FORMS[PIP_DEFAULT_LINE]

export const lineFormCount = (line) => lineForms(line).length

/** The form's geometry; unknown lines fall back to herb and unknown forms to form 1, so a bad payload never blanks Pip. */
export const pipForm = (line, form) => lineForms(line)[form - 1] ?? lineForms(line)[0]

/** The wardrobe anchors of every form of every line, in the unscaled 200-unit space. */
export const PIP_FORM_ANCHORS = Object.fromEntries(Object.entries(LINE_FORMS).map(([line, forms]) => [
  line,
  Object.fromEntries(forms.map((f, i) => [i + 1, {
    hat: f.hat,
    eyes: { y: f.eyes.y, gap: f.eyes.gap },
    neck: f.neck,
    waist: f.waist,
    feetTips: f.feet.map(([, tip]) => tip)
  }]))
]))
