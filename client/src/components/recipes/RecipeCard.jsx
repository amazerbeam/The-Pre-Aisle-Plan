import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMealPlan } from '../../hooks/useMealPlan';
import { formatCalories } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { ServingsControl } from './ServingsControl';
import { DayButtons } from './DayButtons';
import { RecipeDetail } from './RecipeDetail';
import styles from './RecipeCard.module.css';

export const RecipeCard = ({ recipe, selectedMealType }) => {
  const { isAuthenticated, user } = useAuth();
  const { createEntry } = useMealPlan();
  const [servings, setServings] = useState(user?.defaultServings || recipe.defaultServings || 1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDayButtons, setShowDayButtons] = useState(false);

  // Use selected meal type from tabs, or first meal type if recipe has multiple
  const mealTypeForEntry = selectedMealType || (recipe.mealTypes && recipe.mealTypes[0]) || 'BREAKFAST';

  const handleDaySelect = async (date) => {
    if (!isAuthenticated) return;

    try {
      await createEntry({
        recipeId: recipe.id,
        planDate: formatDate(date),
        mealType: mealTypeForEntry.toUpperCase(),
        servings: servings,
      });
      setShowDayButtons(false);
    } catch (error) {
      console.error('Failed to add to meal plan:', error);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{recipe.name}</h3>
        <span className={styles.calories}>{formatCalories(recipe.calories)}</span>
      </div>

      <div className={styles.controls}>
        <ServingsControl servings={servings} onChange={setServings} />
      </div>

      {isAuthenticated && (
        <>
          <button
            className={styles.addButton}
            onClick={() => setShowDayButtons(!showDayButtons)}
          >
            {showDayButtons ? 'Cancel' : 'Add to Meal Plan'}
          </button>

          {showDayButtons && (
            <div className={styles.dayButtonsContainer}>
              <DayButtons onDaySelect={handleDaySelect} />
            </div>
          )}
        </>
      )}

      <RecipeDetail
        recipe={recipe}
        servings={servings}
        recipeServings={recipe.defaultServings}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
    </div>
  );
};
