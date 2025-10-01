import { useState, useEffect, useCallback } from 'react';

// A custom hook to manage state in localStorage and sync across tabs.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        // Seed localStorage if it's empty for this key.
        const valueToStore = initialValue instanceof Set ? Array.from(initialValue) : initialValue;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return initialValue;
      }
      
      const parsed = JSON.parse(item);

      // If the hook is initialized with a Set, we must ensure a Set is returned.
      if (initialValue instanceof Set) {
        // If the parsed value from storage is an array, convert it to a Set. This is the happy path.
        if (Array.isArray(parsed)) {
          return new Set(parsed) as T;
        }
        // If the stored value is not an array, it's malformed.
        // Fall back to the initial value to prevent runtime errors.
        console.warn(`localStorage key “${key}” contained malformed data. Falling back to initial state.`);
        return initialValue;
      }

      // For types other than Set, return the parsed value as is.
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // If the value is a Set, convert it to an array before stringifying.
      const storableValue = valueToStore instanceof Set ? Array.from(valueToStore) : valueToStore;
      window.localStorage.setItem(key, JSON.stringify(storableValue));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          
          if (initialValue instanceof Set) {
            // Only update state if the new value from another tab is a valid array for our Set.
            if (Array.isArray(parsed)) {
              setStoredValue(new Set(parsed) as T);
            }
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
