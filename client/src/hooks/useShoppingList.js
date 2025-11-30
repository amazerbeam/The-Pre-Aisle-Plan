import { useMemo } from 'react';
import { useMealPlan } from './useMealPlan';
import { aggregateIngredients, groupByAisle } from '../utils/aggregateIngredients';

export const useShoppingList = () => {
  const { entries } = useMealPlan();

  const ingredients = useMemo(() => {
    return aggregateIngredients(entries);
  }, [entries]);

  const groupedByAisle = useMemo(() => {
    return groupByAisle(ingredients);
  }, [ingredients]);

  return {
    ingredients,
    groupedByAisle,
  };
};
