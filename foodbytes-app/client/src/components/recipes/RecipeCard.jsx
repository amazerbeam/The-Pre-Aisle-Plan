import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRecipes } from '../../hooks/useRecipes';
import RecipeDetail from './RecipeDetail';
import Button from '../common/Button';
import Modal from '../common/Modal';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
  const { isAdmin } = useAuth();
  const { toggleVisibility } = useRecipes();
  const [servings, setServings] = useState(recipe.default_servings || 1);
  const [showDetail, setShowDetail] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  const handleToggleVisibility = async () => {
    try {
      setIsTogglingVisibility(true);
      await toggleVisibility(recipe.id, !recipe.is_live);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleAddToPlan = () => {
    // This will be connected to calendar/meal plan modal
    console.log('Add to plan:', recipe.id, servings);
  };

  return (
    <>
      <div className="recipe-card">
        {!recipe.is_live && isAdmin() && (
          <span className="badge badge--danger recipe-card__hidden-badge">
            Hidden
          </span>
        )}

        <div className="recipe-card__header">
          <h3 className="recipe-card__title">{recipe.name}</h3>
          <div className="recipe-card__meta">
            <span className="recipe-card__calories">{recipe.calories} cal</span>
          </div>
        </div>

        <div className="recipe-card__body">
          <div className="recipe-card__servings">
            <label htmlFor={`servings-${recipe.id}`}>Servings:</label>
            <input
              id={`servings-${recipe.id}`}
              type="number"
              min="1"
              max="20"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              className="recipe-card__servings-input"
            />
          </div>

          {recipe.meal_types && (
            <div className="recipe-card__tags">
              {recipe.meal_types.map((type) => (
                <span key={type} className="badge recipe-card__tag">
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="recipe-card__footer">
          <Button
            variant="outline"
            size="small"
            onClick={() => setShowDetail(true)}
            fullWidth
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleAddToPlan}
            fullWidth
          >
            Add to Plan
          </Button>

          {isAdmin() && (
            <Button
              variant={recipe.is_live ? 'danger' : 'secondary'}
              size="small"
              onClick={handleToggleVisibility}
              loading={isTogglingVisibility}
              fullWidth
            >
              {recipe.is_live ? 'Hide' : 'Show'}
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={recipe.name}
        size="large"
      >
        <RecipeDetail recipe={recipe} servings={servings} />
      </Modal>
    </>
  );
};

export default RecipeCard;
