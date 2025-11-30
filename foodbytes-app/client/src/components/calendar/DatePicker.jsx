import { format } from 'date-fns';
import './DatePicker.css';

const DatePicker = ({ selectedDate, onChange, label, minDate, maxDate }) => {
  const handleChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      onChange(new Date(dateValue + 'T00:00:00'));
    }
  };

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const formattedMinDate = minDate ? format(minDate, 'yyyy-MM-dd') : undefined;
  const formattedMaxDate = maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined;

  return (
    <div className="date-picker">
      {label && <label className="date-picker__label">{label}</label>}
      <input
        type="date"
        value={formattedDate}
        onChange={handleChange}
        min={formattedMinDate}
        max={formattedMaxDate}
        className="date-picker__input"
      />
    </div>
  );
};

export default DatePicker;
