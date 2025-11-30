import { createContext, useState } from 'react';
import { formatDate, addDaysToDate } from '../utils/dateUtils';

export const DateRangeContext = createContext(null);

export const DateRangeProvider = ({ children }) => {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(formatDate(today));
  const [dateTo, setDateTo] = useState(formatDate(addDaysToDate(today, 6)));

  const setDateRange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const value = {
    dateFrom,
    dateTo,
    setDateRange,
  };

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
};
