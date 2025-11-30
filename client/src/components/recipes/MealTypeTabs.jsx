import styles from './MealTypeTabs.module.css';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const MealTypeTabs = ({ selectedMealType, onMealTypeChange }) => {
  return (
    <div className={styles.tabs}>
      {MEAL_TYPES.map((mealType) => (
        <button
          key={mealType}
          className={`${styles.tab} ${
            selectedMealType === mealType ? styles.active : ''
          }`}
          onClick={() => onMealTypeChange(mealType)}
        >
          {mealType}
        </button>
      ))}
    </div>
  );
};
