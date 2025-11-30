import { useState, useEffect } from 'react';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useDateRange } from '../../hooks/useDateRange';
import { AisleGroup } from './AisleGroup';
import { Button } from '../common/Button';
import styles from './ShoppingList.module.css';

export const ShoppingList = () => {
  const { groupedByAisle } = useShoppingList();
  const { dateFrom, dateTo } = useDateRange();
  const [checkedItems, setCheckedItems] = useState([]);

  // Load checked items from localStorage
  useEffect(() => {
    const key = `shopping-list-${dateFrom}-${dateTo}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    } else {
      setCheckedItems([]);
    }
  }, [dateFrom, dateTo]);

  // Save checked items to localStorage
  useEffect(() => {
    const key = `shopping-list-${dateFrom}-${dateTo}`;
    localStorage.setItem(key, JSON.stringify(checkedItems));
  }, [checkedItems, dateFrom, dateTo]);

  const handleToggleItem = (itemKey) => {
    setCheckedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const handleClearAll = () => {
    if (confirm('Clear all checked items?')) {
      setCheckedItems([]);
    }
  };

  if (!groupedByAisle || groupedByAisle.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No items in your shopping list.</p>
        <p className={styles.hint}>
          Add recipes to your meal plan to generate a shopping list.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.shoppingList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Shopping List</h2>
        {checkedItems.length > 0 && (
          <Button variant="ghost" size="small" onClick={handleClearAll}>
            Clear Checked
          </Button>
        )}
      </div>

      <div className={styles.groups}>
        {groupedByAisle.map((aisle) => (
          <AisleGroup
            key={aisle.aisleId}
            aisle={aisle}
            checkedItems={checkedItems}
            onToggleItem={handleToggleItem}
          />
        ))}
      </div>
    </div>
  );
};
