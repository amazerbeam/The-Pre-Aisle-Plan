import api from './api'

/**
 * MPP-21: your own snack-free / alcohol-free check-in streaks (MPP-20). Always the
 * caller's, never the meal-plan owner's (per-person Pip, MPP-33).
 *
 * HabitStatus = { habit: 'SNACK'|'ALCOHOL', current: number, best: number,
 *                 lastAnsweredDate: string|null, askToday: boolean, coversFrom: string }  (dates 'YYYY-MM-DD')
 *
 * MPP-28: read from the pet payload (`pet.habits`); this module only writes.
 */
export const habitService = {
  /**
   * @param {'SNACK'|'ALCOHOL'} habit
   * @param {{ clean: boolean, lapseDate?: string }} body - lapseDate ('YYYY-MM-DD') only when clean is false
   * @returns {Promise<Object>} the updated HabitStatus
   */
  async answerHabit(habit, body) {
    const response = await api.post(`/pet/habits/${habit}/answer`, body)
    return response.data
  },

  /**
   * MPP-35: the one-time "When did you last…?" answer. 400 once that habit has been answered.
   * @param {'SNACK'|'ALCOHOL'} habit
   * @param {{ lastDate: string|null }} body - 'YYYY-MM-DD' (today-30 … today); null = "Can't remember"
   * @returns {Promise<Object>} the updated HabitStatus
   */
  async firstAnswerHabit(habit, body) {
    const response = await api.post(`/pet/habits/${habit}/first-answer`, body)
    return response.data
  }
}

export default habitService
