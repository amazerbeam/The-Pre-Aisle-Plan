import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import recipeService from '../../services/recipeService'
import RecipeCard from './RecipeCard'
import RecipeEditModal from '../admin/RecipeEditModal'
import './SearchView.css'

function SearchView() {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [editingRecipeId, setEditingRecipeId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchRecipes(query)
      } else if (query.trim().length === 0) {
        setRecipes([])
        setSearched(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const searchRecipes = async (searchQuery) => {
    setLoading(true)
    try {
      const data = await recipeService.searchRecipes(searchQuery)
      setRecipes(data)
      setSearched(true)
    } catch (err) {
      console.error('Error searching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setRecipes([])
    setSearched(false)
  }

  const handleBack = () => {
    navigate('/')
  }

  // FR-033: Handle edit and refresh
  const handleEdit = (recipeId) => {
    setEditingRecipeId(recipeId)
  }

  const handleRecipeSave = () => {
    if (query.trim().length >= 2) {
      searchRecipes(query)
    }
  }

  return (
    <div className="search-view">
      <div className="search-header">
        <button className="back-btn" onClick={handleBack}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="search-input-container">
          <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="clear-btn" onClick={handleClear}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="search-results">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && searched && recipes.length === 0 && (
          <p className="no-results">No recipes found for "{query}"</p>
        )}

        {!loading && recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {!searched && !loading && (
          <p className="search-hint">Type at least 2 characters to search...</p>
        )}
      </div>

      {/* FR-033: Recipe Edit Modal */}
      {editingRecipeId && (
        <RecipeEditModal
          recipeId={editingRecipeId}
          isNew={false}
          onClose={() => setEditingRecipeId(null)}
          onSave={handleRecipeSave}
        />
      )}
    </div>
  )
}

export default SearchView
