import { format, addDays, startOfWeek, isSameDay, isPast as dfnIsPast, parse } from 'date-fns';

// Format date to YYYY-MM-DD (for API)
export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Format date for display
export const formatDateDisplay = (date) => {
  return format(date, 'MMM d, yyyy');
};

// Format date for day display (e.g., "Mon 15")
export const formatDayDisplay = (date) => {
  return format(date, 'EEE d');
};

// Get array of dates for the week starting from given date
export const getWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
};

// Get day name (Mon, Tue, etc.)
export const getDayName = (date) => {
  return format(date, 'EEE');
};

// Check if date is today
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

// Check if date is in the past
export const isPast = (date) => {
  return dfnIsPast(date) && !isToday(date);
};

// Parse date string (YYYY-MM-DD) to Date object
export const parseDate = (dateString) => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

// Get start of current week (Monday)
export const getWeekStart = (date = new Date()) => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

// Add days to a date
export const addDaysToDate = (date, days) => {
  return addDays(date, days);
};

// Get date for specific day in current date range
export const getDateForDay = (startDate, dayIndex) => {
  return addDays(startDate, dayIndex);
};
