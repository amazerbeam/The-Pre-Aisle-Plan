import { useState } from 'react';
import Button from '../common/Button';
import './RecipeEditor.css';

const RecipeEditor = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    calories: recipe?.calories || 0,
    default_servings: recipe?.default_servings || 1,
    meal_types: recipe?.meal_types || [],
    is_live: recipe?.is_live ?? true,
    ingredients: recipe?.ingredients || [],
    steps: recipe?.steps || [],
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      meal_types: prev.meal_types.includes(type)
        ? prev.meal_types.filter((t) => t !== type)
        : [...prev.meal_types, type],
    }));
  };

  return (
    <form className="recipe-editor" onSubmit={handleSubmit}>
      <div className="recipe-editor__field">
        <label htmlFor="recipe-name">Recipe Name</label>
        <input
          id="recipe-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="recipe-editor__row">
        <div className="recipe-editor__field">
          <label htmlFor="recipe-calories">Calories</label>
          <input
            id="recipe-calories"
            type="number"
            min="0"
            value={formData.calories}
            onChange={(e) =>
              setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>

        <div className="recipe-editor__field">
          <label htmlFor="recipe-servings">Default Servings</label>
          <input
            id="recipe-servings"
            type="number"
            min="1"
            value={formData.default_servings}
            onChange={(e) =>
              setFormData({
                ...formData,
                default_servings: parseInt(e.target.value) || 1,
              })
            }
            required
          />
        </div>
      </div>

      <div className="recipe-editor__field">
        <label>Meal Types</label>
        <div className="recipe-editor__checkboxes">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
            <label key={type} className="recipe-editor__checkbox">
              <input
                type="checkbox"
                checked={formData.meal_types.includes(type)}
                onChange={() => handleMealTypeToggle(type)}
              />
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="recipe-editor__field">
        <label className="recipe-editor__checkbox">
          <input
            type="checkbox"
            checked={formData.is_live}
            onChange={(e) =>
              setFormData({ ...formData, is_live: e.target.checked })
            }
          />
          <span>Visible to users</span>
        </label>
      </div>

      <div className="recipe-editor__actions">
        <Button type="submit" variant="primary" loading={loading}>
          Save Recipe
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default RecipeEditor;
