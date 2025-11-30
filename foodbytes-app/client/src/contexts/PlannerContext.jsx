import { createContext, useState, useCallback } from 'react';
import mealPlanService from '../services/mealPlanService';

export const PlannerContext = createContext(null);

export const PlannerProvider = ({ children }) => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load meal plans for a date range
   */
  const loadMealPlans = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      const plans = await mealPlanService.getByDateRange(startDate, endDate);
      setMealPlans(plans);
      return plans;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a meal to the plan
   */
  const addMealPlan = useCallback(async (mealPlanData) => {
    try {
      setLoading(true);
      setError(null);
      const newMealPlan = await mealPlanService.create(mealPlanData);
      setMealPlans((prev) => [...prev, newMealPlan]);
      return newMealPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a meal plan entry
   */
  const updateMealPlan = useCallback(async (id, mealPlanData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMealPlan = await mealPlanService.update(id, mealPlanData);
      setMealPlans((prev) =>
        prev.map((plan) => (plan.id === id ? updatedMealPlan : plan))
      );
      return updatedMealPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove a meal from the plan
   */
  const removeMealPlan = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await mealPlanService.delete(id);
      setMealPlans((prev) => prev.filter((plan) => plan.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get meals for a specific date
   */
  const getMealsForDate = useCallback(
    (date) => {
      return mealPlans.filter((plan) => plan.date === date);
    },
    [mealPlans]
  );

  /**
   * Get meals for a specific date and meal type
   */
  const getMealForDateAndType = useCallback(
    (date, mealType) => {
      return mealPlans.find(
        (plan) => plan.date === date && plan.meal_type === mealType
      );
    },
    [mealPlans]
  );

  /**
   * Clear all meal plans from state
   */
  const clearMealPlans = useCallback(() => {
    setMealPlans([]);
  }, []);

  const value = {
    mealPlans,
    loading,
    error,
    loadMealPlans,
    addMealPlan,
    updateMealPlan,
    removeMealPlan,
    getMealsForDate,
    getMealForDateAndType,
    clearMealPlans,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};
