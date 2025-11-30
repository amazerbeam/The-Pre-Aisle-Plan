import { useDateRange } from '../../hooks/useDateRange';
import { parseDate, getDayName, getDateForDay } from '../../utils/dateUtils';
import styles from './DayButtons.module.css';

export const DayButtons = ({ onDaySelect, selectedDays = [] }) => {
  const { dateFrom } = useDateRange();
  const startDate = parseDate(dateFrom);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDayClick = (dayIndex) => {
    const date = getDateForDay(startDate, dayIndex);
    onDaySelect(date);
  };

  return (
    <div className={styles.dayButtons}>
      {days.map((day, index) => (
        <button
          key={day}
          className={`${styles.dayButton} ${
            selectedDays.includes(index) ? styles.selected : ''
          }`}
          onClick={() => handleDayClick(index)}
        >
          {day}
        </button>
      ))}
    </div>
  );
};
