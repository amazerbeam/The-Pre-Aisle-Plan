import { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import RecipeCard from './RecipeCard';
import Loading from '../common/Loading';
import './RecipeList.css';

const MEAL_TYPES = [
  { value: 'all', label: 'All Recipes' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
];

const RecipeList = () => {
  const [selectedMealType, setSelectedMealType] = useState('all');
  const { filteredRecipes, loading, error } = useRecipes(selectedMealType);

  if (loading) {
    return <Loading fullScreen text="Loading recipes..." />;
  }

  if (error) {
    return (
      <div className="recipe-list__error">
        <p>Failed to load recipes: {error}</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <div className="recipe-list__header">
        <h1>Recipes</h1>
        <div className="recipe-list__filters">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              className={`recipe-list__filter ${
                selectedMealType === type.value
                  ? 'recipe-list__filter--active'
                  : ''
              }`}
              onClick={() => setSelectedMealType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="recipe-list__grid">
        {filteredRecipes.length === 0 ? (
          <div className="recipe-list__empty">
            <p>No recipes found for this category.</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeList;
