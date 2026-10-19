import { useEffect, useState } from 'react'

const STORAGE_KEY = 'recipeFinder.favorites'

function readFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    // Corrupt/blocked storage shouldn't crash the app — just start empty.
    return []
  }
}

/**
 * Manages the favorites list and keeps it in sync with localStorage, so
 * saved recipes survive a refresh and are viewable offline.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavoritesFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota limits).
    }
  }, [favorites])

  function isFavorite(id) {
    return favorites.some((meal) => meal.idMeal === id)
  }

  function toggleFavorite(meal) {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.idMeal === meal.idMeal)
      if (exists) {
        return prev.filter((m) => m.idMeal !== meal.idMeal)
      }
      // Store only the fields the grid/card need, so favorites work offline
      // without needing to re-fetch anything just to render a card.
      const { idMeal, strMeal, strMealThumb, strCategory } = meal
      return [...prev, { idMeal, strMeal, strMealThumb, strCategory }]
    })
  }

  return { favorites, isFavorite, toggleFavorite }
}
