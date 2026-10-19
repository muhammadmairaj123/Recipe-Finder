export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  if (!categories.length) return null

  return (
    <div className="category-filter" role="group" aria-label="Filter by category">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.strCategory
        return (
          <button
            key={cat.idCategory}
            type="button"
            className={`chip${isActive ? ' chip--active' : ''}`}
            onClick={() => onSelect(isActive ? null : cat.strCategory)}
            aria-pressed={isActive}
          >
            {cat.strCategory}
          </button>
        )
      })}
    </div>
  )
}
