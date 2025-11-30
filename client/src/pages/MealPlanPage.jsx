import { useWakeLock } from '../hooks/useWakeLock';
import { Calendar } from '../components/calendar/Calendar';
import styles from './MealPlanPage.module.css';

export const MealPlanPage = () => {
  useWakeLock(true);

  return (
    <div className={styles.mealPlanPage}>
      <Calendar />
    </div>
  );
};
