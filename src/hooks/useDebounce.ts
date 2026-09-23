import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay (default 450ms).
 * Used for search input to avoid firing API requests on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 450): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
