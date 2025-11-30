import { useState, useEffect, useCallback } from 'react';
import recipeService from '../services/recipeService';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing recipes
 * @param {string} mealType - Optional meal type filter
 * @returns {Object} Recipes state and methods
 */
export const useRecipes = (mealType = null) => {
  const { isAdmin } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all recipes
   */
  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Admins use admin endpoint (sees all recipes), regular users use public endpoint
      const data = isAdmin()
        ? await recipeService.getAllAdmin()
        : await recipeService.getAll();

      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  /**
   * Filter recipes by meal type
   */
  const filterByMealType = useCallback(
    (type) => {
      if (!type || type === 'all') {
        setFilteredRecipes(recipes);
      } else {
        setFilteredRecipes(
          recipes.filter((recipe) => recipe.meal_types?.includes(type))
        );
      }
    },
    [recipes]
  );

  /**
   * Toggle recipe visibility (admin only)
   */
  const toggleVisibility = useCallback(
    async (recipeId, isLive) => {
      try {
        const updatedRecipe = await recipeService.toggleVisibility(recipeId, isLive);
        setRecipes((prev) =>
          prev.map((recipe) => (recipe.id === recipeId ? updatedRecipe : recipe))
        );
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  /**
   * Create new recipe (admin only)
   */
  const createRecipe = useCallback(async (recipeData) => {
    try {
      setLoading(true);
      const newRecipe = await recipeService.create(recipeData);
      setRecipes((prev) => [...prev, newRecipe]);
      return newRecipe;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update recipe (admin only)
   */
  const updateRecipe = useCallback(async (recipeId, recipeData) => {
    try {
      setLoading(true);
      const updatedRecipe = await recipeService.update(recipeId, recipeData);
      setRecipes((prev) =>
        prev.map((recipe) => (recipe.id === recipeId ? updatedRecipe : recipe))
      );
      return updatedRecipe;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete recipe (admin only)
   */
  const deleteRecipe = useCallback(async (recipeId) => {
    try {
      setLoading(true);
      await recipeService.delete(recipeId);
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Filter recipes when mealType or recipes change
  useEffect(() => {
    filterByMealType(mealType);
  }, [mealType, filterByMealType]);

  return {
    recipes,
    filteredRecipes,
    loading,
    error,
    loadRecipes,
    filterByMealType,
    toggleVisibility,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
};
