import api from './api'

/**
 * MPP-21: your own snack-free / alcohol-free check-in streaks (MPP-20). Always the
 * caller's, never the meal-plan owner's (per-person Pip, MPP-33).
 *
 * HabitStatus = { habit: 'SNACK'|'ALCOHOL', current: number, best: number,
 *                 lastAnsweredDate: string|null, askToday: boolean, coversFrom: string }  (dates 'YYYY-MM-DD')
 */
export const habitService = {
  /**
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<Object[]>} HabitStatus for SNACK and ALCOHOL
   */
  async getHabits({ signal } = {}) {
    const response = await api.get('/pet/habits', { signal })
    return response.data
  },

  /**
   * @param {'SNACK'|'ALCOHOL'} habit
   * @param {{ clean: boolean, lapseDate?: string }} body - lapseDate ('YYYY-MM-DD') only when clean is false
   * @returns {Promise<Object>} the updated HabitStatus
   */
  async answerHabit(habit, body) {
    const response = await api.post(`/pet/habits/${habit}/answer`, body)
    return response.data
  }
}

export default habitService
