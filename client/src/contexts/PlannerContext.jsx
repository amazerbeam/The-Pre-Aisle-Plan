import { createContext, useState, useEffect } from 'react';
import { mealPlanService } from '../services/mealPlanService';
import { useDateRange } from '../hooks/useDateRange';
import { useAuth } from '../hooks/useAuth';

export const PlannerContext = createContext(null);

export const PlannerProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dateFrom, dateTo } = useDateRange();
  const { isAuthenticated } = useAuth();

  // Fetch entries when date range changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [dateFrom, dateTo, isAuthenticated]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mealPlanService.getEntries(dateFrom, dateTo);
      setEntries(data);
    } catch (err) {
      setError(err.message);
      console.error('Fetch entries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (entry) => {
    try {
      const newEntry = await mealPlanService.createEntry(entry);
      setEntries([...entries, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEntry = async (id, entry) => {
    try {
      const updatedEntry = await mealPlanService.updateEntry(id, entry);
      setEntries(entries.map((e) => (e.id === id ? updatedEntry : e)));
      return updatedEntry;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await mealPlanService.deleteEntry(id);
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
};
