import { useState } from 'react';
import Button from '../common/Button';
import './RecipeDetail.css';

const RecipeDetail = ({ recipe, servings }) => {
  const [copied, setCopied] = useState(false);

  const servingMultiplier = servings / (recipe.default_servings || 1);

  const formatIngredient = (ingredient) => {
    const quantity = (ingredient.quantity * servingMultiplier).toFixed(2);
    return `${quantity} ${ingredient.unit} ${ingredient.name}`;
  };

  const handleCopy = async () => {
    try {
      const text = `
${recipe.name}
Servings: ${servings}
Calories: ${recipe.calories * servingMultiplier}

INGREDIENTS:
${recipe.ingredients.map((ing) => `- ${formatIngredient(ing)}`).join('\n')}

INSTRUCTIONS:
${recipe.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
      `.trim();

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="recipe-detail">
      <div className="recipe-detail__header">
        <div className="recipe-detail__meta">
          <span>Servings: {servings}</span>
          <span>Calories: {Math.round(recipe.calories * servingMultiplier)}</span>
        </div>
        <Button size="small" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Recipe'}
        </Button>
      </div>

      <div className="recipe-detail__section">
        <h3>Ingredients</h3>
        <ul className="recipe-detail__ingredients">
          {recipe.ingredients?.map((ingredient, index) => (
            <li key={index}>{formatIngredient(ingredient)}</li>
          ))}
        </ul>
      </div>

      <div className="recipe-detail__section">
        <h3>Instructions</h3>
        <ol className="recipe-detail__steps">
          {recipe.steps?.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDetail;
