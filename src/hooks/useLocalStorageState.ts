import * as React from 'react';

export function useLocalStorageState<T>(
  defaultValue: T | (() => T),
  key: string
) {
  const [state, setState] = React.useState<T>(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      try {
        return JSON.parse(valueInLocalStorage) as T;
      } catch {
        window.localStorage.removeItem(key);
      }
    }

    return defaultValue instanceof Function ? defaultValue() : defaultValue;
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
