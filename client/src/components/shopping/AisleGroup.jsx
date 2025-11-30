import { ShoppingItem } from './ShoppingItem';
import styles from './AisleGroup.module.css';

export const AisleGroup = ({ aisle, checkedItems, onToggleItem }) => {
  // Use aisle color from grouped data or fallback to misc color
  const aisleColor = aisle.aisleColor || 'var(--aisle-misc)';

  return (
    <div className={styles.group}>
      <h3 className={styles.header} style={{ borderLeftColor: aisleColor }}>
        {aisle.aisleName}
        <span className={styles.count}>({aisle.ingredients.length})</span>
      </h3>
      <div className={styles.items}>
        {aisle.ingredients.map((ingredient) => (
          <ShoppingItem
            key={`${ingredient.ingredientId}-${ingredient.unitId}`}
            ingredient={ingredient}
            checked={checkedItems.includes(
              `${ingredient.ingredientId}-${ingredient.unitId}`
            )}
            onToggle={() =>
              onToggleItem(`${ingredient.ingredientId}-${ingredient.unitId}`)
            }
          />
        ))}
      </div>
    </div>
  );
};
