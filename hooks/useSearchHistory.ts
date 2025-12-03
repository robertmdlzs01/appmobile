import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = '@eventu_search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = useCallback(async (query: string) => {
    if (!query.trim()) return;

    try {
      const trimmedQuery = query.trim().toLowerCase();
      const updatedHistory = [
        trimmedQuery,
        ...history.filter((item) => item !== trimmedQuery),
      ].slice(0, MAX_HISTORY_ITEMS);

      setHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [history]);

  const clearHistory = useCallback(async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  const removeFromHistory = useCallback(async (query: string) => {
    try {
      const updatedHistory = history.filter((item) => item !== query);
      setHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }, [history]);

  return {
    history,
    isLoading,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
