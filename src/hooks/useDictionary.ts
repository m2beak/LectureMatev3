import { useState, useCallback } from "react";
import { DictionaryResult } from "@/types/note";

export const useDictionary = () => {
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupWord = useCallback(async (word: string) => {
    if (!word.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Word not found. Try another word.");
        } else {
          setError("Failed to look up word. Please try again.");
        }
        return;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setResult(data[0]);
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    lookupWord,
    clearResult,
  };
};
