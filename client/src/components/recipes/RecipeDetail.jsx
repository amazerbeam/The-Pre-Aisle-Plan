import { IngredientList } from './IngredientList';
import styles from './RecipeDetail.module.css';

export const RecipeDetail = ({ recipe, servings, recipeServings, isExpanded, onToggle }) => {
  return (
    <div className={styles.detail}>
      <button className={styles.toggleButton} onClick={onToggle}>
        {isExpanded ? 'Hide Details' : 'View Details'}
      </button>

      {isExpanded && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Ingredients</h4>
            <IngredientList
              ingredients={recipe.ingredients}
              servings={servings}
              recipeServings={recipeServings || recipe.defaultServings}
            />
          </section>

          {recipe.steps && recipe.steps.length > 0 && (
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Steps</h4>
              <ol className={styles.stepsList}>
                {recipe.steps.map((step, index) => (
                  <li key={index} className={styles.step}>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
