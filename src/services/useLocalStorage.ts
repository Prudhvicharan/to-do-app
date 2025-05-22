import { useState, useEffect, useCallback } from "react";
import { LocalStorageService } from "../services/localStorage";

/**
 * Custom hook for localStorage with React state synchronization
 * Provides automatic state updates when localStorage changes
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state with value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    return LocalStorageService.get(key, defaultValue);
  });

  // Update localStorage and state
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to localStorage
        LocalStorageService.set(key, valueToStore);

        // Update state
        setStoredValue(valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove item from localStorage and reset to default
  const removeValue = useCallback(() => {
    try {
      LocalStorageService.remove(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error
          );
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed
        setStoredValue(defaultValue);
      }
    };

    // Listen for storage events (changes from other tabs)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for boolean values with toggle functionality
 */
export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useLocalStorage(key, defaultValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, [setValue]);

  const setBoolean = useCallback(
    (newValue: boolean) => {
      setValue(newValue);
    },
    [setValue]
  );

  return [value, toggle, setBoolean];
}

/**
 * Hook for array values with helper methods
 */
export function useLocalStorageArray<T>(
  key: string,
  defaultValue: T[] = []
): [
  T[],
  {
    push: (item: T) => void;
    remove: (index: number) => void;
    clear: () => void;
    update: (index: number, item: T) => void;
    set: (items: T[]) => void;
  }
] {
  const [array, setArray] = useLocalStorage(key, defaultValue);

  const push = useCallback(
    (item: T) => {
      setArray((prev) => [...prev, item]);
    },
    [setArray]
  );

  const remove = useCallback(
    (index: number) => {
      setArray((prev) => prev.filter((_, i) => i !== index));
    },
    [setArray]
  );

  const clear = useCallback(() => {
    setArray([]);
  }, [setArray]);

  const update = useCallback(
    (index: number, item: T) => {
      setArray((prev) =>
        prev.map((existing, i) => (i === index ? item : existing))
      );
    },
    [setArray]
  );

  const set = useCallback(
    (items: T[]) => {
      setArray(items);
    },
    [setArray]
  );

  return [
    array,
    {
      push,
      remove,
      clear,
      update,
      set,
    },
  ];
}

/**
 * Hook to check localStorage availability and usage
 */
export function useLocalStorageInfo() {
  const [info, setInfo] = useState(() => LocalStorageService.getStorageInfo());

  const refreshInfo = useCallback(() => {
    setInfo(LocalStorageService.getStorageInfo());
  }, []);

  // Refresh info when component mounts and on storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      refreshInfo();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshInfo]);

  return { ...info, refresh: refreshInfo };
}
