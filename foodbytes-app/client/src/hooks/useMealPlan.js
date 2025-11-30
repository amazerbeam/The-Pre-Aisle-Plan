import { useContext } from 'react';
import { PlannerContext } from '../contexts/PlannerContext';

/**
 * Custom hook to access meal planner context
 * @returns {Object} Planner context value
 */
export const useMealPlan = () => {
  const context = useContext(PlannerContext);

  if (!context) {
    throw new Error('useMealPlan must be used within a PlannerProvider');
  }

  return context;
};
