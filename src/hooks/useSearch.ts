import { useState, useEffect, useRef } from "react";
import type { ResourceMode, SearchResult } from "../types";
import { searchReleaseGroups, searchArtists } from "../services/musicbrainz";

export function useSearch(mode: ResourceMode) {
  const [inputValue, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = inputValue.trim();
    if (!trimmed) return;

    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results =
          mode === "release"
            ? await searchReleaseGroups(trimmed)
            : await searchArtists(trimmed);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputValue, mode]);

  function clearSuggestions() {
    setSuggestions([]);
    setInput("");
  }

  // Derive: empty input → no suggestions shown, avoids stale results flash
  const visibleSuggestions = inputValue.trim() ? suggestions : [];

  return { inputValue, setInput, suggestions: visibleSuggestions, isSearching, clearSuggestions };
}
