/**
 * MPP-28 AC 2: what Pip says — one line, highest first:
 * cook sequence > new award / outfit (then a shop line) > stage change > check-in question > fridge-low > mood.
 *
 * An announcement and an open check-in question share the bubble: the announcement leads and the
 * question keeps its buttons, so an answer that earns an award never hides the next question.
 * The stage change never competes: usePipGrowth holds while a cook line or announcement speaks.
 *
 * @param {{ cookLine?: string|null, announcement?: string|null, growthLine?: string|null,
 *           checkIn?: { text: string, prompt: string|null, actions: Object|null }|null,
 *           fridgeLine?: string|null, moodLine?: string|null }} lines
 * @returns {{ text: string|null, actions: Object|null }}
 */
export function pipBubble({ cookLine = null, announcement = null, growthLine = null, checkIn = null, fridgeLine = null, moodLine = null }) {
  if (cookLine) return say(cookLine)
  if (announcement) {
    return checkIn?.actions
      ? { text: [announcement, checkIn.prompt].filter(Boolean).join(' '), actions: checkIn.actions }
      : say(announcement)
  }
  if (growthLine) return say(growthLine)
  if (checkIn) return { text: checkIn.text, actions: checkIn.actions }
  return say(fridgeLine ?? moodLine)
}

const say = (text) => ({ text, actions: null })
