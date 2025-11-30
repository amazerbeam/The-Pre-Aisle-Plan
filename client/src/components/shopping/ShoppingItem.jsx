import { formatIngredient } from '../../utils/formatters';
import styles from './ShoppingItem.module.css';

export const ShoppingItem = ({ ingredient, checked, onToggle }) => {
  // Use aisleColor from backend, fallback to misc color
  const aisleColor = ingredient.aisleColor || 'var(--aisle-misc)';

  return (
    <div
      className={`${styles.item} ${checked ? styles.checked : ''}`}
      style={{ borderLeftColor: aisleColor }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className={styles.checkbox}
        id={`ingredient-${ingredient.ingredientId}`}
      />
      <label
        htmlFor={`ingredient-${ingredient.ingredientId}`}
        className={styles.label}
      >
        {formatIngredient(ingredient)}
      </label>
    </div>
  );
};
