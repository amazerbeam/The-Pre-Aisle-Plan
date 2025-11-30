import { useState } from 'react';
import styles from './RecipeCard.module.css';

const RecipeCard = ({ recipe, onAddToDay, isAdmin }) => {
  const [expanded, setExpanded] = useState(false);
  const [servings, setServings] = useState(recipe.defaultServings || 2);

  const scaledCalories = Math.round((recipe.calories / recipe.defaultServings) * servings);

  const scaleQuantity = (qty) => {
    const scaled = (qty / recipe.defaultServings) * servings;
    return scaled % 1 === 0 ? scaled : scaled.toFixed(1);
  };

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{recipe.name}</h3>
          {recipe.isCheat && <span className={styles.cheatBadge}>Cheat</span>}
          {isAdmin && !recipe.isLive && <span className={styles.hiddenBadge}>Hidden</span>}
        </div>
        <div className={styles.meta}>
          <span className={styles.calories}>{scaledCalories} cal</span>
          <div className={styles.servingsControl}>
            <button
              onClick={() => setServings(s => Math.max(1, s - 1))}
              className={styles.servingsBtn}
              disabled={servings <= 1}
            >
              -
            </button>
            <span className={styles.servingsValue}>{servings}</span>
            <button
              onClick={() => setServings(s => Math.min(10, s + 1))}
              className={styles.servingsBtn}
              disabled={servings >= 10}
            >
              +
            </button>
          </div>
        </div>
      </header>

      <div className={styles.actions}>
        <button
          className={styles.detailsBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
        {onAddToDay && (
          <button
            className={styles.addBtn}
            onClick={() => onAddToDay(recipe, servings)}
          >
            Add to Plan
          </button>
        )}
      </div>

      {expanded && (
        <div className={styles.details}>
          <div className={styles.ingredients}>
            <h4>Ingredients</h4>
            <ul>
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} style={{ borderLeftColor: ing.aisleColor }}>
                  {scaleQuantity(ing.quantity)} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.steps}>
            <h4>Steps</h4>
            <ol>
              {recipe.steps?.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
};

export default RecipeCard;
