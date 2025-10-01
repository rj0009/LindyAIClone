import { useState, useEffect, useCallback } from 'react';

// A custom hook to manage state in localStorage and sync across tabs.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage, parse stored json, or return initialValue.
  // This function also seeds localStorage with the initialValue if it's empty.
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
          // Seed localStorage if it's empty for this key.
          // If the initial value is a Set, convert it to an array for storage.
          const valueToStore = initialValue instanceof Set ? Array.from(initialValue) : initialValue;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return initialValue;
      }
      const parsed = JSON.parse(item);
      // If the initial value was a Set and we're reading an array, convert it back to a Set.
      if (initialValue instanceof Set && Array.isArray(parsed)) {
        return new Set(parsed) as T;
      }
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value.
  // Pass initial state function to useState so logic is only executed once.
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // If the value is a Set, convert it to an array before storing.
      const storableValue = valueToStore instanceof Set ? Array.from(valueToStore) : valueToStore;
      window.localStorage.setItem(key, JSON.stringify(storableValue));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  // Listen for changes to this key in other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            // Also handle Set conversion for storage events
            if (initialValue instanceof Set && Array.isArray(parsed)) {
                setStoredValue(new Set(parsed) as T);
            } else {
                setStoredValue(parsed);
            }
          } catch (error) {
            console.warn(`Error parsing localStorage key “${key}” on storage event:`, error);
          }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
