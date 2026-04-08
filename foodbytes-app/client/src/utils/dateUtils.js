/**
 * Date utility functions for meal planning
 * Supports FR-007 (date range)
 */

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
export const formatDateISO = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse an ISO date string to a Date object
 * @param {string} dateStr - ISO format date string (YYYY-MM-DD)
 * @returns {Date}
 */
export const parseISODate = (dateStr) => {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get today's date as ISO string
 * @returns {string}
 */
export const getTodayISO = () => {
  return formatDateISO(new Date())
}

/**
 * Add days to a date
 * @param {Date|string} date - Date object or ISO string
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const d = typeof date === 'string' ? parseISODate(date) : new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Get short day name (Mon, Tue, etc.)
 * @param {Date|string} date
 * @returns {string}
 */
export const getShortDayName = (date) => {
  const d = typeof date === 'string' ? parseISODate(date) : date
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Check if two dates are the same day
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? date1 : formatDateISO(date1)
  const d2 = typeof date2 === 'string' ? date2 : formatDateISO(date2)
  return d1 === d2
}

/**
 * Check if a date is today
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isToday = (date) => {
  return isSameDay(date, new Date())
}

/**
 * Generate array of 7 days starting from a date
 * @param {Date|string} startDate
 * @returns {Array<{date: string, dayName: string, isToday: boolean}>}
 */
export const getWeekDays = (startDate) => {
  const start = typeof startDate === 'string' ? parseISODate(startDate) : startDate
  const today = formatDateISO(new Date())

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    const dateStr = formatDateISO(date)
    return {
      date: dateStr,
      dayName: getShortDayName(date),
      isToday: dateStr === today
    }
  })
}

/**
 * Format date for display (e.g., "Dec 1")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  const d = typeof date === 'string' ? parseISODate(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format date range for display (e.g., "Dec 1 - Dec 7")
 * @param {string} startDate - ISO format
 * @param {string} endDate - ISO format
 * @returns {string}
 */
export const formatDateRange = (startDate, endDate) => {
  return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`
}
