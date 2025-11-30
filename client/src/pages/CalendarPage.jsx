import { useState, useEffect } from 'react';
import { format, addDays, eachDayOfInterval, isToday, isBefore, startOfDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useDateRange } from '../contexts/DateRangeContext';
import api from '../services/api';
import styles from './CalendarPage.module.css';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'];

const CalendarPage = () => {
  const { isAuthenticated } = useAuth();
  const { dateFrom, dateTo } = useDateRange();
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMealPlan();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, dateFrom, dateTo]);

  const fetchMealPlan = async () => {
    try {
      const response = await api.get('/meal-plan', {
        params: {
          from: format(dateFrom, 'yyyy-MM-dd'),
          to: format(dateTo, 'yyyy-MM-dd')
        }
      });
      setMealPlan(response.data);
    } catch (err) {
      console.error('Failed to fetch meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({ start: dateFrom, end: dateTo });

  const getEntriesForDay = (date, mealType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlan.filter(entry =>
      entry.date === dateStr && entry.mealType === mealType
    );
  };

  const handleDelete = async (entryId) => {
    try {
      await api.delete(`/meal-plan/${entryId}`);
      setMealPlan(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.authRequired}>
          <h2>Sign in to view your meal plan</h2>
          <p>You need to be logged in to create and manage your meal plans.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading meal plan...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Meal Plan</h1>

      <div className={styles.dateRange}>
        <span>{format(dateFrom, 'MMM d')} - {format(dateTo, 'MMM d, yyyy')}</span>
      </div>

      <div className={styles.calendar}>
        {days.map(day => (
          <div
            key={day.toISOString()}
            className={`${styles.dayCard} ${isToday(day) ? styles.today : ''} ${isBefore(day, startOfDay(new Date())) ? styles.past : ''}`}
          >
            <div className={styles.dayHeader}>
              <span className={styles.dayName}>{format(day, 'EEE')}</span>
              <span className={styles.dayDate}>{format(day, 'MMM d')}</span>
            </div>

            <div className={styles.meals}>
              {MEAL_TYPES.map(mealType => {
                const entries = getEntriesForDay(day, mealType);
                return (
                  <div key={mealType} className={styles.mealSlot}>
                    <span className={styles.mealLabel}>
                      {mealType.charAt(0) + mealType.slice(1).toLowerCase()}
                    </span>
                    {entries.length > 0 ? (
                      entries.map(entry => (
                        <div key={entry.id} className={styles.mealEntry}>
                          <span className={styles.recipeName}>{entry.recipeName}</span>
                          <span className={styles.servings}>{entry.servings}x</span>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(entry.id)}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className={styles.empty}>-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
