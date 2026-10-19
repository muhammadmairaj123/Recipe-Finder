import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * have passed without `value` changing. Used on the search input so we
 * don't fire an API call on every keystroke.
 */
export function useDebounce(value, delay = 450) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // If `value` changes again before `delay` elapses, cancel the pending
    // update — this is what actually creates the debounce effect.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
