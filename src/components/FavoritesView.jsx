import RecipeCard from './RecipeCard.jsx'

export default function FavoritesView({ favorites, isFavorite, onToggleFavorite, onOpen }) {
  if (favorites.length === 0) {
    return (
      <div className="state-message">
        <p>You haven't saved any favorites yet. Tap the heart on a recipe to save it here.</p>
      </div>
    )
  }

  return (
    <div className="recipe-grid">
      {favorites.map((meal) => (
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
