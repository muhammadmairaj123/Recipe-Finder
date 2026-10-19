import RecipeCard from './RecipeCard.jsx'

function SkeletonCard() {
  return (
    <div className="recipe-card recipe-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--image" />
      <div className="recipe-card__body">
        <div className="skeleton skeleton--line" style={{ width: '80%' }} />
        <div className="skeleton skeleton--line" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

export default function RecipeGrid({
  meals,
  isLoading,
  error,
  emptyQuery,
  onRetry,
  isFavorite,
  onToggleFavorite,
  onOpen,
}) {
  if (isLoading) {
    return (
      <div className="recipe-grid" aria-busy="true" aria-label="Loading recipes">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-message state-message--error">
        <p>⚠️ {error}</p>
        <button type="button" className="btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (!meals || meals.length === 0) {
    return (
      <div className="state-message">
        <p>
          {emptyQuery
            ? `No recipes found for "${emptyQuery}". Try a different search term.`
            : 'No recipes to show yet — try searching or picking a category above.'}
        </p>
      </div>
    )
  }

  return (
    <div className="recipe-grid">
      {meals.map((meal) => (
        <RecipeCard
          key={meal.idMeal}
          meal={meal}
          isFavorite={isFavorite(meal.idMeal)}
          onToggleFavorite={onToggleFavorite}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
