import { formatDayDisplay, isToday } from '../../utils/dateUtils';
import { formatCalories } from '../../utils/formatters';
import { Button } from '../common/Button';
import styles from './CalendarDay.module.css';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const CalendarDay = ({ date, entries, onDeleteEntry }) => {
  const isCurrentDay = isToday(new Date(date));

  const getMealEntries = (mealType) => {
    return entries.filter((entry) => entry.mealType === mealType);
  };

  const getTotalCalories = () => {
    return entries.reduce((total, entry) => {
      const scaleFactor = entry.servings / entry.recipe.servings;
      return total + entry.recipe.calories * scaleFactor;
    }, 0);
  };

  return (
    <div className={`${styles.day} ${isCurrentDay ? styles.today : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.date}>{formatDayDisplay(new Date(date))}</h3>
        {entries.length > 0 && (
          <span className={styles.totalCalories}>
            {formatCalories(getTotalCalories())}
          </span>
        )}
      </div>

      <div className={styles.meals}>
        {MEAL_TYPES.map((mealType) => {
          const mealEntries = getMealEntries(mealType);
          if (mealEntries.length === 0) return null;

          return (
            <div key={mealType} className={styles.meal}>
              <h4 className={styles.mealType}>{mealType}</h4>
              <div className={styles.entries}>
                {mealEntries.map((entry) => (
                  <div key={entry.id} className={styles.entry}>
                    <div className={styles.entryInfo}>
                      <span className={styles.recipeName}>
                        {entry.recipe.name}
                      </span>
                      <span className={styles.servings}>
                        {entry.servings} servings
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => onDeleteEntry(entry.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <p className={styles.empty}>No meals planned</p>
        )}
      </div>
    </div>
  );
};
