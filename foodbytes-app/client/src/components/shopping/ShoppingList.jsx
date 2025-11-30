import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useMealPlan } from '../../hooks/useMealPlan';
import ShoppingItem from './ShoppingItem';
import DateRangePicker from './DateRangePicker';
import Button from '../common/Button';
import Loading from '../common/Loading';
import './ShoppingList.css';

const ShoppingList = () => {
  const [dateRange, setDateRange] = useState({ start: new Date(), days: 7 });
  const { loadMealPlans, loading } = useMealPlan();
  const { groupedByAisle, checkedItems, toggleChecked, clearChecked, checkAll } =
    useShoppingList();

  useEffect(() => {
    const startDate = format(dateRange.start, 'yyyy-MM-dd');
    const endDate = format(addDays(dateRange.start, dateRange.days - 1), 'yyyy-MM-dd');
    loadMealPlans(startDate, endDate);
  }, [dateRange, loadMealPlans]);

  const handleCopyList = async () => {
    try {
      let text = 'Shopping List\n\n';
      Object.entries(groupedByAisle).forEach(([aisle, items]) => {
        text += `${aisle}:\n`;
        items.forEach((item) => {
          const key = `${item.name}-${item.unit}`;
          const checked = checkedItems[key] ? '[x]' : '[ ]';
          text += `  ${checked} ${item.quantity.toFixed(2)} ${item.unit} ${item.name}\n`;
        });
        text += '\n';
      });

      await navigator.clipboard.writeText(text);
      alert('Shopping list copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading shopping list..." />;
  }

  const totalItems = Object.values(groupedByAisle).reduce(
    (sum, items) => sum + items.length,
    0
  );
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="shopping-list">
      <div className="shopping-list__header">
        <h1>Shopping List</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="shopping-list__actions">
        <div className="shopping-list__progress">
          {checkedCount} of {totalItems} items checked
        </div>
        <div className="shopping-list__buttons">
          <Button size="small" variant="ghost" onClick={clearChecked}>
            Clear All
          </Button>
          <Button size="small" variant="ghost" onClick={checkAll}>
            Check All
          </Button>
          <Button size="small" variant="outline" onClick={handleCopyList}>
            Copy List
          </Button>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="shopping-list__empty">
          <p>No meals planned for this date range.</p>
          <p>Add recipes to your meal plan to generate a shopping list.</p>
        </div>
      ) : (
        <div className="shopping-list__aisles">
          {Object.entries(groupedByAisle).map(([aisle, items]) => (
            <div key={aisle} className="shopping-list__aisle">
              <h3 className="shopping-list__aisle-name">{aisle}</h3>
              <div className="shopping-list__items">
                {items.map((item) => (
                  <ShoppingItem
                    key={`${item.name}-${item.unit}`}
                    item={item}
                    checked={checkedItems[`${item.name}-${item.unit}`] || false}
                    onToggle={() => toggleChecked(`${item.name}-${item.unit}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
