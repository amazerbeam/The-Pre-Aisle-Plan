import { PIP_LINE } from './pipLines.js'

/** MPP-49: Pip's Path, the first Pip game. The server issues and checks every map; this is client copy and tuning. */
export const PIPS_PATH_ENDPOINT = '/pet/games/pips-path'
export const PIPS_PATH_FAMILY = 'garden-path'
export const PIPS_PATH_LEVELS = 10
export const PIPS_PATH_MAX_COLS = 6 // 288 px ÷ 6 = 48 px tiles at a 320 px window

export const GAME_MODE = { CHAPTER: 'CHAPTER', REFRESHER: 'REFRESHER', ENDLESS: 'ENDLESS' }
export const GAMES_SCREEN = { PICKER: 'picker', MAP: 'map', BOARD: 'board' }
export const MAP_NODE = { CLEARED: 'cleared', CURRENT: 'current', LOCKED: 'locked' }

export const KEY_TO_DELTA = {
  ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0]
}
export const RESTART_KEY = 'r'

export const GAME_OFFER_LINE = 'Play a game with me? 🎲'
export const GAME_OFFER_PLAY = 'Play a game'
export const GAME_OFFER_NOT_NOW = 'Not now'
export const GAMES_TITLE = 'Games'
export const GAMES_CLOSE_LABEL = 'Close games'
export const PIPS_PATH_NAME = "Pip's Path"
export const PIPS_PATH_ENDLESS_SUB = 'Endless · random puzzles'
export const MORE_GAMES_TITLE = 'More games soon'
export const MORE_GAMES_SUB = "More of Pip's games are on the way"
export const ENDLESS_CARD = { title: 'Random puzzle', sub: 'A fresh puzzle from every game you have cleared.' }
export const REFRESHER_CARD = { title: 'Refresher', sub: 'A fresh puzzle from an earlier chapter.' }
export const GAMES_LOAD_ERROR = "Couldn't load your games."
export const GAMES_ISSUE_ERROR = "Couldn't start that puzzle."
export const GAMES_CLEAR_ERROR = "Couldn't save your clear."
export const GAMES_BAD_MAP = "This puzzle didn't load."
export const GAMES_RETRY = 'Try again'
export const GAMES_SAVING = 'Saving…'
export const NEXT_PUZZLE = 'Next puzzle'
export const BACK_TO_MAP = 'Map'
export const GAMES_LOADING = 'Loading…'
export const MODE_LABEL = { [GAME_MODE.ENDLESS]: 'Endless', [GAME_MODE.REFRESHER]: 'Refresher' }

export const PIPS_PATH_SKINS = {
  [PIP_LINE.HERB]: {
    title: 'Garden Path', goal: 'Plant every patch!', trail: 'path', celebrate: 'bloom', stuckFx: 'droop', fxColor: '#f7a8c8',
    lines: { intro: 'Help me plant every patch! 🌱', half: 'Halfway there, keep going!',
             stuck: "Hmm, I'm stuck! Let's start again?", reset: "Oops, I've been there! Back to the start 🌱", cleared: 'The whole garden is growing! 🌸' }
  },
  [PIP_LINE.DRAGON]: {
    title: 'Ember Trail', goal: 'Light every flagstone!', trail: 'ember', celebrate: 'flare', stuckFx: 'dim', fxColor: '#ffb347',
    lines: { intro: 'Light every flagstone with me! 🔥', half: 'Half the lair is glowing!',
             stuck: 'My embers are fading… start again?', reset: 'Already scorched that one! Back to the start 🔥', cleared: 'The whole lair is ablaze! 🐉' }
  },
  [PIP_LINE.ROBOT]: {
    title: 'Circuit Run', goal: 'Power every node!', trail: 'trace', celebrate: 'sweep', stuckFx: 'flicker', fxColor: null,
    lines: { intro: 'Power every node! ⚡', half: '50% charged. Keep routing!',
             stuck: 'ERROR: dead end. Reboot?', reset: 'LOOP DETECTED. Rebooting route… 🤖', cleared: 'Circuit complete! All systems go! 🤖' }
  }
}
// fxColor is skin art (falling petals / rising sparks), kept here so PipsPath.css holds no literal colour.

export const pipsPathSkin = (line) => PIPS_PATH_SKINS[line] ?? PIPS_PATH_SKINS[PIP_LINE.HERB]

/** The clear card's reward line, from the server's PipsPathClearDTO. */
export function rewardLine({ alreadyCleared, paid, capped, dailyCap }) {
  if (alreadyCleared) return 'Already counted'
  const full = `today's game sprinkles are full (${dailyCap}/${dailyCap})`
  if (paid > 0 && capped) return `+${paid} ✨ · ${full}`
  if (paid > 0) return `+${paid} ✨`
  return `Today's game sprinkles are full (${dailyCap}/${dailyCap})`
}

// Board geometry and motion (from the mockup's pp-ui block).
export const TOKEN_SCALE = 1.5 // Pip token height as a multiple of the tile size
export const PIP_BOX_RATIO = 200 / 240 // full Pip viewBox, width over height
export const PIP_FOOT_RATIO = 226 / 240 // feet sit this far down the viewBox
export const TOKEN_FOOT_DROP = 0.28 // feet sit this fraction of a tile below the tile centre
export const DRAG_STEP_RATIO = 0.5 // sample a fast drag at half-tile steps
export const FX_BIT_COUNT = 12
export const FX_STAGGER_STEPS = 4
export const FX_STAGGER_MS = 120
export const CELEBRATION_MS = 3200
export const MINI_GRID_CELLS = 9 // 3 × 3 preview on the picker card
export const MINI_MARK_CELLS = [3, 6, 7]
