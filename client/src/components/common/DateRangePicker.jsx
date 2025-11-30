import { useDateRange } from '../../hooks/useDateRange';
import { formatDate } from '../../utils/dateUtils';
import styles from './DateRangePicker.module.css';

export const DateRangePicker = () => {
  const { dateFrom, dateTo, setDateRange } = useDateRange();

  const handleFromChange = (e) => {
    const newFrom = e.target.value;
    if (newFrom <= dateTo) {
      setDateRange(newFrom, dateTo);
    }
  };

  const handleToChange = (e) => {
    const newTo = e.target.value;
    if (newTo >= dateFrom) {
      setDateRange(dateFrom, newTo);
    }
  };

  return (
    <div className={styles.dateRangePicker}>
      <div className={styles.inputGroup}>
        <label htmlFor="dateFrom" className={styles.label}>
          From
        </label>
        <input
          id="dateFrom"
          type="date"
          value={dateFrom}
          onChange={handleFromChange}
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="dateTo" className={styles.label}>
          To
        </label>
        <input
          id="dateTo"
          type="date"
          value={dateTo}
          onChange={handleToChange}
          className={styles.input}
        />
      </div>
    </div>
  );
};
