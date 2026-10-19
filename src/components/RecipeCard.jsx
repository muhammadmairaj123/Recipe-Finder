export default function RecipeCard({ meal, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <div className="recipe-card" onClick={() => onOpen(meal)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(meal) }}
    >
      <div className="recipe-card__image-wrap">
        <img
          className="recipe-card__image"
          src={`${meal.strMealThumb}/preview`}
          alt={meal.strMeal}
          loading="lazy"
        />
        <button
          type="button"
          className={`recipe-card__fav${isFavorite ? ' recipe-card__fav--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(meal)
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'}>
            <path
              d="M12 21s-6.7-4.35-9.3-8.2C1 10.1 1.6 6.6 4.6 5.1c2.3-1.15 4.8-.3 6.2 1.6l1.2 1.6 1.2-1.6c1.4-1.9 3.9-2.75 6.2-1.6 3 1.5 3.6 5 1.9 7.7C18.7 16.65 12 21 12 21z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{meal.strMeal}</h3>
        {meal.strCategory && <span className="recipe-card__category">{meal.strCategory}</span>}
      </div>
    </div>
  )
}
