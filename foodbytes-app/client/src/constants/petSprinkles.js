/**
 * MPP-42: sprinkles copy — the Shop's ✨ Earn tab, the footnote link, the recent list and the header
 * count-up. Amounts live on the server (RecentSprinklesDTO.rates); this file only names things.
 * Copy follows pip-sprinkles-earn-mockup.html (Version B).
 */
export const EARN_TAB_LABEL = '✨ Earn'
export const EARN_INTRO = 'Pip pays sprinkles for keeping your plan going. Spend them in the other tabs.'
export const EARN_FOOT_TEXT = 'How do I earn sprinkles?'
export const EARN_FOOT_LINK = 'See Earn →'
export const EARN_NEW_TAG = 'New'
export const EARN_LOADING = 'Loading your sprinkles…'
export const EARN_LOAD_ERROR = "Couldn't load your sprinkles. Check your connection and try again."
export const EARN_RETRY_LABEL = 'Try again'

// AC 2, in order. rateKey names a RecentSprinklesDTO.rates field.
export const EARN_WAYS = [
  { key: 'meal', icon: '🍽', title: 'Eat a planned meal', detail: 'Tick breakfast, lunch or dinner as eaten, on its day or any day after. Late still counts.', rateKey: 'mealEaten' },
  { key: 'onTime', icon: '⏰', title: 'Eat it on time', detail: 'Bonus when it’s ticked on its day, by its meal time.', rateKey: 'onTimeBonus' },
  { key: 'homemade', icon: '🥖', title: 'Make the extra homemade', detail: 'The meal’s extra (bread, sauce…) is set to homemade.', rateKey: 'homemadeBonus' },
  { key: 'fullWeek', icon: '📅', title: 'Plan a full week', detail: 'Every day Mon–Sun has breakfast, lunch and dinner. Pays both of you on a shared plan.', rateKey: 'fullWeek' },
  { key: 'listMade', icon: '🧾', title: 'Make a shopping list', detail: 'Generate the week’s list. Once a week, pays both of you.', rateKey: 'shoppingListGenerated', isNew: true },
  { key: 'listDone', icon: '🛒', title: 'Finish the shopping', detail: 'Tick off every item on the list. Once a week, pays both of you.', rateKey: 'shoppingListCompleted', isNew: true }
]

export const GOOD_WEEK_TITLE = 'A good week'
export const GOOD_WEEK_LABELS = {
  meals: count => `${count} meals eaten`,
  onTime: '…all on time',
  fullWeek: 'Full week planned',
  shopping: 'Shopping list made + finished',
  total: 'About'
}

export const RECENT_TITLE = 'Your recent sprinkles'
export const RECENT_EMPTY = 'Nothing in the last two weeks yet. Tick a meal you’ve eaten to start.'

// AC 6
export const GOOD_TO_KNOW_TITLE = 'Good to know'
export const GOOD_TO_KNOW = [
  'Snacks and extras on their own don’t pay.',
  'Forgot to tick? A meal ticked later still pays, just not the on-time bonus.',
  'Ticking a meal before its day doesn’t pay.',
  'Each meal pays once. Un-ticking doesn’t take sprinkles back.',
  'Your meals pay you. A full week and the shopping pay you both.',
  'The shopping rewards pay once per Mon–Sun week, however many lists you make.'
]

// Recent-list wording (utils/sprinkleHistory.js).
export const RECENT_TEXT = {
  eaten: meal => `${meal} eaten`,
  mealFallback: 'Meal eaten',
  onTime: 'on time',
  homemade: 'homemade',
  fullWeek: range => `Full week planned (${range})`,
  listMade: 'Shopping list made',
  listDone: 'Shopping finished',
  bought: name => `Bought the ${name}`,
  boughtStyle: (name, isWall) => `Bought the ${name} ${isWall ? 'walls' : 'floor'}`,
  spendFallback: 'Shop purchase',
  earnFallback: 'Sprinkles earned'
}
export const RELATIVE_DAY = { today: 'Today', yesterday: 'Yesterday' }
export const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Header count-up (AC 15, 18) — mockup timings.
export const SPRINKLES_SEEN_STORAGE_KEY = 'foodbytes.pip.sprinklesSeen'
export const COUNT_UP_DELAY_MS = 400
export const COUNT_UP_MIN_MS = 700
export const COUNT_UP_MAX_MS = 1600
export const COUNT_UP_MS_PER_SPRINKLE = 6
export const GAIN_PILL_MS = 1900
export const GAIN_PILL_REDUCED_MS = 2000
export const GOLD_HOLD_MS = 500
export const SPARK_COUNT = 7
export const SPRINKLES_LIVE_TEXT = (gain, total) => `You earned ${gain} sprinkles. Total ${total} sprinkles.`
export const EARNED_FALLBACK_LINE = gain => `+${gain} sprinkles! ✨`
