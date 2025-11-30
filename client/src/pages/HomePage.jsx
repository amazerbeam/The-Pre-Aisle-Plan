import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/recipes/RecipeCard';
import api from '../services/api';
import styles from './HomePage.module.css';

const MEAL_TABS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'];

const HomePage = () => {
  const { isAdmin } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BREAKFAST');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      setRecipes(response.data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery === '' ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMealType = recipe.mealTypes?.includes(activeTab);

    return matchesSearch && matchesMealType;
  });

  // Sort: non-cheat first, then alphabetically
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (a.isCheat !== b.isCheat) return a.isCheat ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return <div className={styles.loading}>Loading recipes...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        {MEAL_TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className={styles.searchBar}>
        <input
          type="search"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.recipeList}>
        {sortedRecipes.length === 0 ? (
          <p className={styles.noRecipes}>No recipes found</p>
        ) : (
          sortedRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
