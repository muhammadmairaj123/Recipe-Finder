// api/mealdb.js
//
// All network calls to TheMealDB live in this one file. That way, in an
// interview, I can point to a single place and explain exactly what happens
// when the API is slow, down, or returns something unexpected.
//
// Every function here follows the same contract:
//   - It never throws a raw fetch/network error up to the component.
//   - It always resolves to a plain value (array/object) on success.
//   - On failure it throws a small, predictable Error with a human-readable
//     `message`, so the UI layer only has to do `catch (err) { setError(err.message) }`.

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

// TheMealDB is generally fast, but on a flaky connection a fetch can hang
// indefinitely. We race it against a timeout so the UI never gets stuck on
// a spinner forever.
const REQUEST_TIMEOUT_MS = 10000

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      // TheMealDB rarely sends non-200s, but if it (or a proxy) does,
      // surface a clear status-based message rather than a generic one.
      throw new Error(`Request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.')
    }
    if (err instanceof TypeError) {
      // fetch() throws a TypeError for genuine network failures (offline,
      // DNS failure, CORS, etc.)
      throw new Error('Network error — please check your internet connection.')
    }
    // Re-throw anything else (e.g. the status-code error above) as is.
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Search meals by name.
 * TheMealDB returns { meals: null } when nothing matches — this is not an
 * error, just an empty result set, so we normalize it to [].
 */
export async function searchMealsByName(query) {
  const data = await fetchWithTimeout(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`)
  return data.meals ?? []
}

/**
 * Get all recipe categories (for the filter chips).
 */
export async function getCategories() {
  const data = await fetchWithTimeout(`${BASE_URL}/categories.php`)
  return data.categories ?? []
}

/**
 * Filter meals by category. Note: this endpoint returns "lightweight" meal
 * objects (idMeal, strMeal, strMealThumb only) — full details are fetched
 * separately, on demand, when a card is opened.
 */
export async function filterMealsByCategory(category) {
  const data = await fetchWithTimeout(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`)
  return data.meals ?? []
}

/**
 * Look up full details for a single meal by id — used for the detail modal.
 */
export async function getMealById(id) {
  const data = await fetchWithTimeout(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`)
  const meals = data.meals ?? []
  return meals[0] ?? null
}

/**
 * Small helper used by the detail modal: TheMealDB stores ingredients and
 * measurements as 20 separate flat fields (strIngredient1..20 /
 * strMeasure1..20) instead of an array. This turns that into a clean list
 * and drops any entry that is empty, null, or just whitespace.
 */
export function parseIngredients(meal) {
  if (!meal) return []
  const ingredients = []

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]

    if (ingredient && ingredient.trim() !== '') {
      ingredients.push({
        id: i,
        name: ingredient.trim(),
        measure: measure && measure.trim() !== '' ? measure.trim() : '',
      })
    }
  }

  return ingredients
}
