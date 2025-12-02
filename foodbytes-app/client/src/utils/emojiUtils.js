/**
 * FR-041: Emoji utilities for meal plan display
 * Provides themed emoji pools by meal type with consistent selection
 */

// Emoji pools by meal type (8-10 options each)
const EMOJI_POOLS = {
  breakfast: ['🍳', '🥞', '🧇', '🥣', '🥐', '🍩', '☕', '🥯', '🥚', '🥓'],
  lunch: ['🥗', '🥪', '🍲', '🌯', '🥙', '🍱', '🥡', '🍜', '🌮'],
  dinner: ['🍝', '🍕', '🍔', '🍖', '🥘', '🍛', '🍣', '🌮', '🥩', '🍗'],
  snacks: ['🍎', '🍌', '🥜', '🍿', '🧁', '🍪', '🍫', '🥤', '🍇', '🥕']
}

/**
 * Get a consistent emoji for a meal based on date and meal type.
 * The same date + meal type will always return the same emoji,
 * but different dates will show variety.
 *
 * @param {string} date - ISO date string (e.g., "2025-12-01")
 * @param {string} mealType - Meal type key (breakfast, lunch, dinner, snacks)
 * @returns {string} An emoji from the appropriate pool
 */
export const getEmojiForMeal = (date, mealType) => {
  const pool = EMOJI_POOLS[mealType?.toLowerCase()] || EMOJI_POOLS.snacks

  // Create a simple hash from the date string for consistent selection
  // This ensures the same date always gets the same emoji within a meal type
  const dateHash = (date || '').split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  // Add meal type hash for variety between meal types on same day
  const mealHash = (mealType || '').split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  const index = (dateHash + mealHash) % pool.length
  return pool[index]
}

/**
 * Get a random emoji from a meal type's pool.
 * Use this for truly random selection (e.g., one-time display).
 *
 * @param {string} mealType - Meal type key (breakfast, lunch, dinner, snacks)
 * @returns {string} A random emoji from the appropriate pool
 */
export const getRandomEmoji = (mealType) => {
  const pool = EMOJI_POOLS[mealType?.toLowerCase()] || EMOJI_POOLS.snacks
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Get the emoji pool for a specific meal type.
 *
 * @param {string} mealType - Meal type key (breakfast, lunch, dinner, snacks)
 * @returns {string[]} Array of emojis for that meal type
 */
export const getEmojiPool = (mealType) => {
  return EMOJI_POOLS[mealType?.toLowerCase()] || EMOJI_POOLS.snacks
}

export default {
  getEmojiForMeal,
  getRandomEmoji,
  getEmojiPool,
  EMOJI_POOLS
}
