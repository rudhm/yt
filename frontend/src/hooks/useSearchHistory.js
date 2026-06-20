import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useSearchHistory(maxItems = 10) {
  const [history, setHistory] = useLocalStorage('lapop-search-history', []);

  const addSearch = useCallback(
    (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setHistory((prev) => {
        const filtered = prev.filter((entry) => entry.query !== trimmed);
        return [{ query: trimmed, timestamp: Date.now() }, ...filtered].slice(
          0,
          maxItems
        );
      });
    },
    [setHistory, maxItems]
  );

  const removeSearch = useCallback(
    (query) => {
      setHistory((prev) => prev.filter((entry) => entry.query !== query));
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return { history, addSearch, removeSearch, clearHistory };
}
