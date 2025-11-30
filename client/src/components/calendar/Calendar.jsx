import { useMemo } from 'react';
import { useMealPlan } from '../../hooks/useMealPlan';
import { useDateRange } from '../../hooks/useDateRange';
import { parseDate, getWeekDays, formatDate } from '../../utils/dateUtils';
import { CalendarDay } from './CalendarDay';
import { DateNavigator } from './DateNavigator';
import { Loading } from '../common/Loading';
import styles from './Calendar.module.css';

export const Calendar = () => {
  const { entries, loading, deleteEntry } = useMealPlan();
  const { dateFrom } = useDateRange();

  const weekDays = useMemo(() => {
    const startDate = parseDate(dateFrom);
    return getWeekDays(startDate);
  }, [dateFrom]);

  const getEntriesForDate = (date) => {
    const dateStr = formatDate(date);
    return entries.filter((entry) => entry.date === dateStr);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className={styles.calendar}>
      <DateNavigator />
      <div className={styles.grid}>
        {weekDays.map((date) => (
          <CalendarDay
            key={formatDate(date)}
            date={formatDate(date)}
            entries={getEntriesForDate(date)}
            onDeleteEntry={deleteEntry}
          />
        ))}
      </div>
    </div>
  );
};
