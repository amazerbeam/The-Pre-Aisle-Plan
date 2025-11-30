import { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import { MealTypeTabs } from '../components/recipes/MealTypeTabs';
import { RecipeList } from '../components/recipes/RecipeList';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { Loading } from '../components/common/Loading';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [selectedMealType]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipes({
        mealType: selectedMealType,
      });
      setRecipes(data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchRecipes();
      return;
    }

    try {
      setLoading(true);
      const data = await recipeService.searchRecipes(
        searchQuery,
        selectedMealType
      );
      setRecipes(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recipe Browser</h1>
        <DateRangePicker />
      </div>

      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </div>

      <MealTypeTabs
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
      />

      {loading ? <Loading fullScreen /> : <RecipeList recipes={recipes} selectedMealType={selectedMealType} />}
    </div>
  );
};
