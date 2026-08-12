import { useEffect, useState } from "react";

/** useState that mirrors into localStorage, so carts survive a refresh. */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Private-mode or quota errors shouldn't take the page down.
    }
  }, [key, state]);

  return [state, setState];
}
