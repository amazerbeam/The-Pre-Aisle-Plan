import { format } from 'date-fns';
import './DateRangePicker.css';

const PRESETS = [
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
];

const DateRangePicker = ({ value, onChange }) => {
  const handleStartDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      onChange({ ...value, start: new Date(dateValue + 'T00:00:00') });
    }
  };

  const handlePresetClick = (days) => {
    onChange({ ...value, days });
  };

  return (
    <div className="date-range-picker">
      <div className="date-range-picker__input">
        <label htmlFor="start-date">Start Date:</label>
        <input
          id="start-date"
          type="date"
          value={format(value.start, 'yyyy-MM-dd')}
          onChange={handleStartDateChange}
        />
      </div>

      <div className="date-range-picker__presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.days}
            className={`date-range-picker__preset ${
              value.days === preset.days
                ? 'date-range-picker__preset--active'
                : ''
            }`}
            onClick={() => handlePresetClick(preset.days)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangePicker;
