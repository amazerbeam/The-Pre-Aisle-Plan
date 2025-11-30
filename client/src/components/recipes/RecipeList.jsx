import { RecipeCard } from './RecipeCard';
import styles from './RecipeList.module.css';

export const RecipeList = ({ recipes, selectedMealType }) => {
  if (!recipes || recipes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No recipes found.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} selectedMealType={selectedMealType} />
      ))}
    </div>
  );
};
