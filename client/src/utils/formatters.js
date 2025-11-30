// Format quantity with appropriate decimal places
export const formatQuantity = (quantity) => {
  if (!quantity) return '0';

  // Round to 2 decimal places and remove trailing zeros
  const rounded = Math.round(quantity * 100) / 100;
  return rounded.toString().replace(/\.00$/, '');
};

// Format calories
export const formatCalories = (calories) => {
  if (!calories) return '0 cal';
  return `${Math.round(calories)} cal`;
};

// Format servings
export const formatServings = (servings) => {
  if (servings === 1) return '1 serving';
  return `${servings} servings`;
};

// Format ingredient display (quantity + unit + name)
export const formatIngredient = (ingredient) => {
  const qty = formatQuantity(ingredient.quantity);
  const unit = ingredient.unitValue || ingredient.unitName || '';
  const name = ingredient.ingredientName || '';

  return `${qty} ${unit} ${name}`.trim();
};
