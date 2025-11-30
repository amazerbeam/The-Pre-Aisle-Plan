import { format, isToday, isPast } from 'date-fns';
import { useMealPlan } from '../../hooks/useMealPlan';
import Button from '../common/Button';
import './CalendarDay.css';

const CalendarDay = ({ date }) => {
  const { getMealsForDate, removeMealPlan } = useMealPlan();
  const dateString = format(date, 'yyyy-MM-dd');
  const meals = getMealsForDate(dateString);

  const handleRemoveMeal = async (mealPlanId) => {
    if (window.confirm('Remove this meal from your plan?')) {
      try {
        await removeMealPlan(mealPlanId);
      } catch (error) {
        console.error('Failed to remove meal:', error);
      }
    }
  };

  const handleAddMeal = () => {
    // This will open a modal to select recipe
    console.log('Add meal for', dateString);
  };

  const dayClasses = [
    'calendar-day',
    isToday(date) ? 'calendar-day--today' : '',
    isPast(date) && !isToday(date) ? 'calendar-day--past' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={dayClasses}>
      <div className="calendar-day__header">
        <span className="calendar-day__weekday">{format(date, 'EEE')}</span>
        <span className="calendar-day__date">{format(date, 'd')}</span>
      </div>

      <div className="calendar-day__meals">
        {meals.length === 0 ? (
          <div className="calendar-day__empty">No meals planned</div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="calendar-day__meal">
              <div className="calendar-day__meal-header">
                <span className="calendar-day__meal-type">{meal.meal_type}</span>
                <button
                  className="calendar-day__meal-remove"
                  onClick={() => handleRemoveMeal(meal.id)}
                  aria-label="Remove meal"
                >
                  &times;
                </button>
              </div>
              <div className="calendar-day__meal-name">{meal.recipe?.name}</div>
              <div className="calendar-day__meal-servings">
                {meal.servings} serving{meal.servings !== 1 ? 's' : ''}
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        size="small"
        variant="ghost"
        fullWidth
        onClick={handleAddMeal}
        className="calendar-day__add"
      >
        + Add Meal
      </Button>
    </div>
  );
};

export default CalendarDay;
