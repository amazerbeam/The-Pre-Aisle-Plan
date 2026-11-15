/**
 * Themed Pip lines: one Pip, one points total, three skins. The server (PetGrowthPolicy.Line) owns
 * the thresholds; the client owns names and voice. The active theme's `pipLine` picks the line.
 *
 * Reserved names for later forms (not shipped — append in order):
 *   dragon: Dragon → Elder Dragon → Ancient Wyrm → Great Wyrm
 *   robot:  Synth → Cyborg Prime → Mech → Titan Frame
 */
export const PIP_LINE = { HERB: 'herb', DRAGON: 'dragon', ROBOT: 'robot' }

export const PIP_DEFAULT_LINE = PIP_LINE.HERB

export const PIP_LINE_COPY = {
  [PIP_LINE.HERB]: {
    formNames: { 1: 'Basil seed', 2: 'Seedling', 3: 'Sprig', 4: 'Bushling', 5: 'Basilisk' },
    fullyGrownLabel: 'Fully grown 🌸',
    fullyGrownLine: "I'm fully grown! 🌸 Thank you for looking after me.",
    slipLine: "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!",
    evolveEmoji: '🌱'
  },
  [PIP_LINE.DRAGON]: {
    formNames: { 1: 'Hatchling', 2: 'Wyrmling', 3: 'Drake' },
    fullyGrownLabel: 'Fully grown 🐉',
    fullyGrownLine: "I'm a full-grown drake! 🐉 Thank you for raising me.",
    slipLine: "Oof, I singed a few scales 🔥 A good day and they'll grow back!",
    evolveEmoji: '🐉'
  },
  [PIP_LINE.ROBOT]: {
    formNames: { 1: 'Bot-kid', 2: 'Teen Unit', 3: 'Android' },
    fullyGrownLabel: 'Fully upgraded ⚙️',
    fullyGrownLine: 'Upgrade complete! ⚙️ Thank you for building me.',
    slipLine: "Battery dipped a little 🔋 A good day and I'll recharge!",
    evolveEmoji: '⚙️'
  }
}

export const lineCopy = (line) => PIP_LINE_COPY[line] ?? PIP_LINE_COPY[PIP_DEFAULT_LINE]

export const formName = (line, form) => lineCopy(line).formNames[form] ?? lineCopy(line).formNames[1]
