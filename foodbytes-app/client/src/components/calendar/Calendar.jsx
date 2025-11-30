import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { useMealPlan } from '../../hooks/useMealPlan';
import CalendarDay from './CalendarDay';
import Loading from '../common/Loading';
import Button from '../common/Button';
import './Calendar.css';

const Calendar = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const { loadMealPlans, loading, error } = useMealPlan();

  useEffect(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    loadMealPlans(
      format(currentWeekStart, 'yyyy-MM-dd'),
      format(weekEnd, 'yyyy-MM-dd')
    );
  }, [currentWeekStart, loadMealPlans]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  if (loading) {
    return <Loading fullScreen text="Loading meal plan..." />;
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <h1>Meal Planner</h1>
        <div className="calendar__controls">
          <Button size="small" variant="ghost" onClick={handlePreviousWeek}>
            &larr; Previous
          </Button>
          <Button size="small" variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button size="small" variant="ghost" onClick={handleNextWeek}>
            Next &rarr;
          </Button>
        </div>
      </div>

      {error && <div className="calendar__error">Error: {error}</div>}

      <div className="calendar__week">
        <div className="calendar__days">
          {weekDays.map((date) => (
            <CalendarDay key={date.toISOString()} date={date} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
