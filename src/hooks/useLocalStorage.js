import { useState, useEffect } from "react";

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const json = window.localStorage.getItem(key);
    if (json != null) {
      try {
        return JSON.parse(json);
      } catch {
        /* ... */
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}
