// Aggregate ingredients from meal plan entries
export const aggregateIngredients = (mealPlanEntries) => {
  const ingredientMap = new Map();

  mealPlanEntries.forEach((entry) => {
    const { servings, recipeDefaultServings, ingredients } = entry;

    // Skip entries without ingredients (e.g., deleted recipes)
    if (!ingredients || ingredients.length === 0) return;

    const scaleFactor = servings / (recipeDefaultServings || 1);

    ingredients.forEach((ingredient) => {
      const key = `${ingredient.ingredientId}-${ingredient.unitId}`;
      const scaledQuantity = parseFloat(ingredient.quantity) * scaleFactor;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        existing.quantity += scaledQuantity;
      } else {
        ingredientMap.set(key, {
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredient.ingredientName,
          quantity: scaledQuantity,
          unitId: ingredient.unitId,
          unitValue: ingredient.unitValue,
          aisleId: ingredient.aisleId,
          aisleName: ingredient.aisleName,
          aisleColor: ingredient.aisleColor,
          checked: false,
        });
      }
    });
  });

  return Array.from(ingredientMap.values());
};

// Group ingredients by aisle
export const groupByAisle = (ingredients) => {
  const grouped = {};

  ingredients.forEach((ingredient) => {
    const aisleId = ingredient.aisleId || 17; // Default to "Other"
    if (!grouped[aisleId]) {
      grouped[aisleId] = {
        aisleId,
        aisleName: ingredient.aisleName || 'Other',
        aisleColor: ingredient.aisleColor || '#bdc3c7',
        ingredients: [],
      };
    }
    grouped[aisleId].ingredients.push(ingredient);
  });

  // Convert to array and sort by aisle ID
  return Object.values(grouped).sort((a, b) => a.aisleId - b.aisleId);
};
