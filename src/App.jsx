import { useEffect, useState, useCallback } from 'react'
import SearchBar from './components/SearchBar.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import RecipeGrid from './components/RecipeGrid.jsx'
import RecipeDetailModal from './components/RecipeDetailModal.jsx'
import FavoritesView from './components/FavoritesView.jsx'
import { useDebounce } from './hooks/useDebounce.js'
import { useFavorites } from './hooks/useFavorites.js'
import { useDarkMode } from './hooks/useDarkMode.js'
import { searchMealsByName, filterMealsByCategory, getCategories } from './api/mealdb.js'

// Shown when the search box is empty and no category is selected, so the
// homepage isn't just a blank void. "chicken" is an arbitrary but reliable
// term that returns a good spread of results from TheMealDB.
const DEFAULT_QUERY = 'chicken'

export default function App() {
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'favorites'
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 450)

  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  const [meals, setMeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [openMealId, setOpenMealId] = useState(null)
  const [isDark, toggleDark] = useDarkMode()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()

  // Load categories once on mount for the filter chips.
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {
        // Non-fatal: the app still works without category chips, so we
        // silently degrade instead of blocking the whole page on an error.
        setCategories([])
      })
  }, [])

  const loadMeals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let results
      if (activeCategory) {
        results = await filterMealsByCategory(activeCategory)
      } else {
        results = await searchMealsByName(debouncedQuery.trim() || DEFAULT_QUERY)
      }
      setMeals(results)
    } catch (err) {
      setError(err.message)
      setMeals([])
    } finally {
      setIsLoading(false)
    }
  }, [activeCategory, debouncedQuery])

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  function handleSelectCategory(category) {
    setActiveCategory(category)
  }

  const isShowingDefault = !activeCategory && !debouncedQuery.trim()

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <h1 className="header__title">🍲 Recipe Finder</h1>
          <div className="header__actions">
            <nav className="tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'search'}
                className={`tab${activeTab === 'search' ? ' tab--active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                Search
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'favorites'}
                className={`tab${activeTab === 'favorites' ? ' tab--active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                Favorites {favorites.length > 0 && <span className="tab__badge">{favorites.length}</span>}
              </button>
            </nav>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {activeTab === 'search' ? (
          <>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelect={handleSelectCategory}
            />
            {isShowingDefault && !isLoading && !error && (
              <p className="section-hint">Popular recipes to get you started:</p>
            )}
            <RecipeGrid
              meals={meals}
              isLoading={isLoading}
              error={error}
              emptyQuery={activeCategory ? activeCategory : debouncedQuery.trim()}
              onRetry={loadMeals}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onOpen={(meal) => setOpenMealId(meal.idMeal)}
            />
          </>
        ) : (
          <FavoritesView
            favorites={favorites}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onOpen={(meal) => setOpenMealId(meal.idMeal)}
          />
        )}
      </main>

      {openMealId && (
        <RecipeDetailModal
          mealId={openMealId}
          onClose={() => setOpenMealId(null)}
          isFavorite={isFavorite(openMealId)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}
