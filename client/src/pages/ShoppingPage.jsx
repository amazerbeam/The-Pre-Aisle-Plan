import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useDateRange } from '../contexts/DateRangeContext';
import api from '../services/api';
import styles from './ShoppingPage.module.css';

const ShoppingPage = () => {
  const { isAuthenticated } = useAuth();
  const { dateFrom, dateTo } = useDateRange();
  const [mealPlan, setMealPlan] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('shoppingListState');
    return saved ? new Map(JSON.parse(saved)) : new Map();
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, dateFrom, dateTo]);

  useEffect(() => {
    localStorage.setItem('shoppingListState', JSON.stringify([...checkedItems]));
  }, [checkedItems]);

  const fetchData = async () => {
    try {
      const [recipesRes] = await Promise.all([
        api.get('/recipes')
      ]);
      setRecipes(recipesRes.data);

      if (isAuthenticated) {
        const mealPlanRes = await api.get('/meal-plan', {
          params: {
            from: format(dateFrom, 'yyyy-MM-dd'),
            to: format(dateTo, 'yyyy-MM-dd')
          }
        });
        setMealPlan(mealPlanRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate ingredients from meal plan
  const aggregatedIngredients = useMemo(() => {
    const totals = new Map();

    mealPlan.forEach(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId);
      if (!recipe) return;

      const scaleFactor = entry.servings / recipe.defaultServings;

      recipe.ingredients?.forEach(ing => {
        const key = `${ing.name}|${ing.unit}`;
        const existing = totals.get(key);
        const scaledQty = ing.quantity * scaleFactor;

        if (existing) {
          existing.quantity += scaledQty;
        } else {
          totals.set(key, {
            name: ing.name,
            quantity: scaledQty,
            unit: ing.unit,
            aisle: ing.aisle,
            aisleColor: ing.aisleColor
          });
        }
      });
    });

    return Array.from(totals.values());
  }, [mealPlan, recipes]);

  // Sort by: unchecked first, then aisle, then name
  const sortedIngredients = useMemo(() => {
    return [...aggregatedIngredients].sort((a, b) => {
      const aKey = `${a.name}|${a.unit}`;
      const bKey = `${b.name}|${b.unit}`;
      const aChecked = checkedItems.get(aKey) || false;
      const bChecked = checkedItems.get(bKey) || false;

      if (aChecked !== bChecked) return aChecked ? 1 : -1;
      if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle);
      return a.name.localeCompare(b.name);
    });
  }, [aggregatedIngredients, checkedItems]);

  const toggleItem = (name, unit) => {
    const key = `${name}|${unit}`;
    setCheckedItems(prev => {
      const newMap = new Map(prev);
      newMap.set(key, !prev.get(key));
      return newMap;
    });
  };

  const uncheckAll = () => {
    if (window.confirm('Uncheck all items?')) {
      setCheckedItems(new Map());
    }
  };

  const formatQuantity = (qty) => {
    return qty % 1 === 0 ? qty : qty.toFixed(1);
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.authRequired}>
          <h2>Sign in to view your shopping list</h2>
          <p>Your shopping list is generated from your meal plan.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading shopping list...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shopping List</h1>
        <button onClick={uncheckAll} className={styles.uncheckBtn}>
          Uncheck All
        </button>
      </div>

      <div className={styles.dateRange}>
        {format(dateFrom, 'MMM d')} - {format(dateTo, 'MMM d, yyyy')}
      </div>

      {sortedIngredients.length === 0 ? (
        <div className={styles.empty}>
          <p>No ingredients in your shopping list.</p>
          <p>Add recipes to your meal plan to generate a list.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {sortedIngredients.map(ing => {
            const key = `${ing.name}|${ing.unit}`;
            const isChecked = checkedItems.get(key) || false;

            return (
              <li
                key={key}
                className={`${styles.item} ${isChecked ? styles.checked : ''}`}
                style={{ borderLeftColor: ing.aisleColor }}
                onClick={() => toggleItem(ing.name, ing.unit)}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => { }}
                  className={styles.checkbox}
                />
                <span className={styles.quantity}>
                  {formatQuantity(ing.quantity)} {ing.unit}
                </span>
                <span className={styles.ingredientName}>{ing.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ShoppingPage;
