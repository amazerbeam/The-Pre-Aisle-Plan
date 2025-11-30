import { useDateRange } from '../../hooks/useDateRange';
import { parseDate, addDaysToDate, formatDate } from '../../utils/dateUtils';
import { Button } from '../common/Button';
import styles from './DateNavigator.module.css';

export const DateNavigator = () => {
  const { dateFrom, dateTo, setDateRange } = useDateRange();

  const handlePrevious = () => {
    const currentFrom = parseDate(dateFrom);
    const newFrom = addDaysToDate(currentFrom, -7);
    const newTo = addDaysToDate(newFrom, 6);
    setDateRange(formatDate(newFrom), formatDate(newTo));
  };

  const handleNext = () => {
    const currentFrom = parseDate(dateFrom);
    const newFrom = addDaysToDate(currentFrom, 7);
    const newTo = addDaysToDate(newFrom, 6);
    setDateRange(formatDate(newFrom), formatDate(newTo));
  };

  return (
    <div className={styles.navigator}>
      <Button variant="ghost" onClick={handlePrevious}>
        ← Previous Week
      </Button>
      <Button variant="ghost" onClick={handleNext}>
        Next Week →
      </Button>
    </div>
  );
};
