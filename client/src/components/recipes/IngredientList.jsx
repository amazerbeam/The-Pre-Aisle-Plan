import { formatIngredient } from '../../utils/formatters';
import styles from './IngredientList.module.css';

export const IngredientList = ({ ingredients, servings, recipeServings }) => {
  const scaleFactor = servings / recipeServings;

  return (
    <ul className={styles.ingredientList}>
      {ingredients.map((ingredient, index) => {
        const scaledQuantity = ingredient.quantity * scaleFactor;
        const scaledIngredient = { ...ingredient, quantity: scaledQuantity };
        const aisleColor = `var(--aisle-${ingredient.aisleId || 17})`;

        return (
          <li
            key={index}
            className={styles.ingredient}
            style={{ borderLeftColor: aisleColor }}
          >
            {formatIngredient(scaledIngredient)}
          </li>
        );
      })}
    </ul>
  );
};
