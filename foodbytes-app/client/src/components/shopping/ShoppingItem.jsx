import './ShoppingItem.css';

// Map aisle names to CSS variable colors
const AISLE_COLORS = {
  Produce: 'var(--aisle-produce)',
  Bakery: 'var(--aisle-bakery)',
  Meat: 'var(--aisle-meat)',
  Seafood: 'var(--aisle-seafood)',
  Dairy: 'var(--aisle-dairy)',
  Frozen: 'var(--aisle-frozen)',
  'Canned Goods': 'var(--aisle-canned)',
  'Dry Goods': 'var(--aisle-dry-goods)',
  Snacks: 'var(--aisle-snacks)',
  Beverages: 'var(--aisle-beverages)',
  Condiments: 'var(--aisle-condiments)',
  Baking: 'var(--aisle-baking)',
  Spices: 'var(--aisle-spices)',
  Ethnic: 'var(--aisle-ethnic)',
  Health: 'var(--aisle-health)',
  Household: 'var(--aisle-household)',
  Other: 'var(--aisle-other)',
};

const ShoppingItem = ({ item, checked, onToggle }) => {
  const aisleColor = AISLE_COLORS[item.aisle] || AISLE_COLORS.Other;

  return (
    <label
      className={`shopping-item ${checked ? 'shopping-item--checked' : ''}`}
      style={{ borderLeftColor: aisleColor }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="shopping-item__checkbox"
      />
      <div className="shopping-item__content">
        <span className="shopping-item__quantity">
          {item.quantity.toFixed(2)} {item.unit}
        </span>
        <span className="shopping-item__name">{item.name}</span>
      </div>
    </label>
  );
};

export default ShoppingItem;
