import { createContext, useState, useContext } from 'react';
import { addDays, startOfDay } from 'date-fns';

const DateRangeContext = createContext();

export const DateRangeProvider = ({ children }) => {
  const today = startOfDay(new Date());

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(addDays(today, 6)); // 7 days total

  const setDateRange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
  };

  return (
    <DateRangeContext.Provider value={{
      dateFrom,
      dateTo,
      setDateFrom,
      setDateTo,
      setDateRange
    }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => useContext(DateRangeContext);
