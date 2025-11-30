import { useMemo, useState, useEffect } from 'react';
import { useMealPlan } from './useMealPlan';

// Aisle order for sorting (matching original FoodBytes)
const AISLE_ORDER = {
  'Produce': 1,
  'Bakery': 2,
  'Meat': 3,
  'Seafood': 4,
  'Dairy': 5,
  'Frozen': 6,
  'Canned Goods': 7,
  'Dry Goods': 8,
  'Snacks': 9,
  'Beverages': 10,
  'Condiments': 11,
  'Baking': 12,
  'Spices': 13,
  'Ethnic': 14,
  'Health': 15,
  'Household': 16,
  'Other': 17,
};

/**
 * Custom hook for shopping list functionality
 * @returns {Object} Shopping list state and methods
 */
export const useShoppingList = () => {
  const { mealPlans } = useMealPlan();
  const [checkedItems, setCheckedItems] = useState({});

  /**
   * Aggregate ingredients from meal plans
   */
  const aggregatedIngredients = useMemo(() => {
    const ingredientMap = new Map();

    mealPlans.forEach((plan) => {
      if (!plan.recipe?.ingredients) return;

      const servingMultiplier = plan.servings / (plan.recipe.default_servings || 1);

      plan.recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name}-${ingredient.unit}`;

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          existing.quantity += ingredient.quantity * servingMultiplier;
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity * servingMultiplier,
            unit: ingredient.unit,
            aisle: ingredient.aisle || 'Other',
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  }, [mealPlans]);

  /**
   * Sort ingredients by checked status, aisle, and name
   */
  const sortedIngredients = useMemo(() => {
    return [...aggregatedIngredients].sort((a, b) => {
      const aKey = `${a.name}-${a.unit}`;
      const bKey = `${b.name}-${b.unit}`;

      // Sort by checked status first (unchecked first)
      const aChecked = checkedItems[aKey] || false;
      const bChecked = checkedItems[bKey] || false;

      if (aChecked !== bChecked) {
        return aChecked ? 1 : -1;
      }

      // Then by aisle order
      const aAisleOrder = AISLE_ORDER[a.aisle] || 999;
      const bAisleOrder = AISLE_ORDER[b.aisle] || 999;

      if (aAisleOrder !== bAisleOrder) {
        return aAisleOrder - bAisleOrder;
      }

      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }, [aggregatedIngredients, checkedItems]);

  /**
   * Group ingredients by aisle
   */
  const groupedByAisle = useMemo(() => {
    const groups = {};

    sortedIngredients.forEach((ingredient) => {
      const aisle = ingredient.aisle || 'Other';
      if (!groups[aisle]) {
        groups[aisle] = [];
      }
      groups[aisle].push(ingredient);
    });

    // Sort aisles by order
    return Object.keys(groups)
      .sort((a, b) => {
        const aOrder = AISLE_ORDER[a] || 999;
        const bOrder = AISLE_ORDER[b] || 999;
        return aOrder - bOrder;
      })
      .reduce((acc, aisle) => {
        acc[aisle] = groups[aisle];
        return acc;
      }, {});
  }, [sortedIngredients]);

  /**
   * Toggle checked state for an ingredient
   */
  const toggleChecked = (ingredientKey) => {
    setCheckedItems((prev) => ({
      ...prev,
      [ingredientKey]: !prev[ingredientKey],
    }));
  };

  /**
   * Clear all checked items
   */
  const clearChecked = () => {
    setCheckedItems({});
  };

  /**
   * Check all items
   */
  const checkAll = () => {
    const allChecked = {};
    sortedIngredients.forEach((ingredient) => {
      const key = `${ingredient.name}-${ingredient.unit}`;
      allChecked[key] = true;
    });
    setCheckedItems(allChecked);
  };

  /**
   * Load checked items from localStorage
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoppingListChecked');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load shopping list state:', error);
    }
  }, []);

  /**
   * Save checked items to localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem('shoppingListChecked', JSON.stringify(checkedItems));
    } catch (error) {
      console.error('Failed to save shopping list state:', error);
    }
  }, [checkedItems]);

  return {
    ingredients: sortedIngredients,
    groupedByAisle,
    checkedItems,
    toggleChecked,
    clearChecked,
    checkAll,
  };
};
