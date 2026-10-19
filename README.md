# 🍲 Recipe Finder

A small, no-signup recipe search app built as a portfolio project. Search recipes
by name, browse by category, view full ingredients/instructions, and save
favorites — all backed by the free [TheMealDB API](https://www.themealdb.com/api.php).

## Problem statement

People often just want to type a dish name (or pick a category) and quickly see
a recipe's ingredients and steps — without ads, sign-ups, or clutter. Recipe
Finder solves that with a single search box, category chips, and a clean detail
view, plus a "Favorites" list saved locally so you don't lose the recipes you
care about, even if the API is temporarily unreachable.

## Tech used

- **React 18** with **Vite** — functional components + hooks only (`useState`,
  `useEffect`), no class components.
- **Plain CSS** (no Tailwind, no UI kit) — CSS variables for theming, CSS Grid
  for the responsive layout. Kept intentionally simple and readable.
- **TheMealDB free API** — no API key required.
- **localStorage** — for favorites and the dark-mode preference.

No other dependencies. `npm install` only pulls in React, Vite, and the React
Vite plugin.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Project structure

```
src/
  api/
    mealdb.js            # all network calls to TheMealDB live here
  hooks/
    useDebounce.js        # debounces the search input
    useFavorites.js        # favorites state, synced to localStorage
    useDarkMode.js         # dark mode state, synced to localStorage
  components/
    SearchBar.jsx
    CategoryFilter.jsx
    RecipeGrid.jsx         # renders loading / error / empty / results
    RecipeCard.jsx
    RecipeDetailModal.jsx  # fetches full detail (lookup.php) on open
    FavoritesView.jsx
  App.jsx
  index.css
```

## How loading / error / empty states are handled

This is the part I'd walk through in an interview, since it's the part that
actually matters for a production app:

- **Loading** — `RecipeGrid` renders 8 skeleton cards (shimmering placeholder
  blocks) instead of a spinner, so the layout doesn't jump once results
  arrive. The detail modal shows a simple "Loading recipe…" message while
  `lookup.php` resolves.

- **Error** — All network calls are centralized in `src/api/mealdb.js`. Every
  function there wraps `fetch` in a `try/catch`, adds a 10-second timeout via
  `AbortController` (so a hung request doesn't spin forever), and normalizes
  every failure mode into a single `Error` with a clear, human-readable
  `message`:
  - a genuine network failure (offline, DNS, CORS) → *"Network error — please
    check your internet connection."*
  - a timeout → *"The request timed out…"*
  - a non-200 response → *"Request failed with status …"*

  Components never see raw `fetch` errors — they just do
  `catch (err) { setError(err.message) }`. `RecipeGrid` then shows that
  message with a **Retry** button that re-runs the last request. This means
  the UI never goes blank on failure, and I can explain the "what happens if
  the API is down" question with one file.

- **Empty** — TheMealDB returns `{ "meals": null }` (not `[]`) when a search
  or filter has zero matches. `mealdb.js` normalizes that to `[]` at the
  source (`data.meals ?? []`), so nothing downstream has to special-case
  `null` vs `[]`. `RecipeGrid` then shows a friendly *"No recipes found for
  '&lt;query&gt;'"* message instead of an empty grid.

- **Empty search input** — rather than showing a blank homepage, an empty
  search box defaults to a search for `"chicken"`, labeled "Popular recipes
  to get you started." This is a product decision explained below.

## Ingredient parsing

TheMealDB stores ingredients as 20 flat fields (`strIngredient1..20` /
`strMeasure1..20`) instead of an array — a quirk of their schema.
`parseIngredients()` in `api/mealdb.js` loops `1..20`, and:
- skips any ingredient that's `null`, `undefined`, or an empty/whitespace
  string (so no blank list items),
- trims whitespace,
- pairs each ingredient with its measure, defaulting to an empty string if
  the measure itself is missing.

## One trade-off I made, and why

**Favorites store a snapshot of the meal, not just its ID.** When you favorite
a recipe, I save `{ idMeal, strMeal, strMealThumb, strCategory }` into
localStorage rather than just the ID and re-fetching details every time the
Favorites tab is opened.

- **Pro:** Favorites renders instantly and works fully offline / with the API
  down, since it never calls TheMealDB.
- **Con:** If a recipe's name or thumbnail ever changed upstream, the
  favorited snapshot would go stale (fine for this API, which is effectively
  static, but a real trade-off if the underlying data changed often). I
  accepted this because "Favorites works offline" is one of the stated
  requirements, and re-fetching on every tab switch would silently break that
  guarantee the moment the network is unavailable — which is exactly when a
  saved-recipes list is most useful.

## Other edge cases handled

- API sometimes returns `meals: null` for zero matches — normalized to `[]`
  before it reaches any component (see above), so nothing crashes on
  `.map()`.
- Empty/blank ingredient or measure fields are filtered out rather than
  rendered as blank `<li>` items.
- Search input is debounced (450ms) via a small custom `useDebounce` hook, so
  typing "chicken curry" fires one request, not eleven.
- Escape key and click-outside both close the recipe detail modal.
- Dark mode and favorites both persist across reloads via `localStorage`,
  wrapped in `try/catch` in case storage is unavailable (e.g. strict private
  browsing).
