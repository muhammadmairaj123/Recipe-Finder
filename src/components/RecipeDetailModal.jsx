import { useEffect, useState } from 'react'
import { getMealById, parseIngredients } from '../api/mealdb.js'

export default function RecipeDetailModal({ mealId, onClose, isFavorite, onToggleFavorite }) {
  const [meal, setMeal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false

    async function loadMeal() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMealById(mealId)
        if (!isCancelled) {
          if (data) {
            setMeal(data)
          } else {
            setError('This recipe could not be found.')
          }
        }
      } catch (err) {
        if (!isCancelled) setError(err.message)
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadMeal()
    return () => {
      isCancelled = true
    }
  }, [mealId])

  // Close on Escape key.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const ingredients = parseIngredients(meal)
  const instructionSteps = meal?.strInstructions
    ? meal.strInstructions
        .split(/\r?\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={meal ? meal.strMeal : 'Recipe details'}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {isLoading && (
          <div className="state-message" style={{ padding: '3rem 1.5rem' }}>
            <p>Loading recipe…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="state-message state-message--error" style={{ padding: '3rem 1.5rem' }}>
            <p>⚠️ {error}</p>
          </div>
        )}

        {!isLoading && !error && meal && (
          <>
            <div className="modal__hero">
              <img src={meal.strMealThumb} alt={meal.strMeal} className="modal__image" />
              <button
                type="button"
                className={`recipe-card__fav modal__fav${isFavorite ? ' recipe-card__fav--active' : ''}`}
                onClick={() => onToggleFavorite(meal)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={isFavorite}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'}>
                  <path
                    d="M12 21s-6.7-4.35-9.3-8.2C1 10.1 1.6 6.6 4.6 5.1c2.3-1.15 4.8-.3 6.2 1.6l1.2 1.6 1.2-1.6c1.4-1.9 3.9-2.75 6.2-1.6 3 1.5 3.6 5 1.9 7.7C18.7 16.65 12 21 12 21z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal__content">
              <h2 className="modal__title">{meal.strMeal}</h2>
              <div className="modal__meta">
                {meal.strCategory && <span className="tag">{meal.strCategory}</span>}
                {meal.strArea && <span className="tag">{meal.strArea}</span>}
              </div>

              <div className="modal__section">
                <h3>Ingredients</h3>
                {ingredients.length > 0 ? (
                  <ul className="ingredient-list">
                    {ingredients.map((ing) => (
                      <li key={ing.id}>
                        <span className="ingredient-list__measure">{ing.measure}</span> {ing.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No ingredient information available.</p>
                )}
              </div>

              <div className="modal__section">
                <h3>Instructions</h3>
                {instructionSteps.length > 0 ? (
                  <ol className="instruction-list">
                    {instructionSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="muted">No instructions available.</p>
                )}
              </div>

              {meal.strYoutube && (
                <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="btn btn--link">
                  Watch video ↗
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
