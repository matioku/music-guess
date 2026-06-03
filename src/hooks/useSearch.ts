import { useState, useEffect, useRef } from "react";
import type { ResourceMode, SearchResult } from "../types";
import { searchReleaseGroups, searchArtists } from "../services/musicbrainz";

export function useSearch(mode: ResourceMode) {
  const [inputValue, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Cancel a stale request so it neither overwrites newer results nor holds a
    // rate-limit slot once the user has moved on.
    const controller = new AbortController();

    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const results =
          mode === "release"
            ? await searchReleaseGroups(trimmed, controller.signal)
            : await searchArtists(trimmed, controller.signal);
        setSuggestions(results);
      } catch {
        if (controller.signal.aborted) return; // superseded — ignore silently
        // Distinguish a real failure from a blank dropdown so the UI can react.
        setSuggestions([]);
        setError("Recherche indisponible, réessayez.");
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      controller.abort();
    };
  }, [inputValue, mode]);

  function clearSuggestions() {
    setSuggestions([]);
    setInput("");
    setError(null);
  }

  // Derive: empty input → no suggestions shown, avoids stale results flash
  const visibleSuggestions = inputValue.trim() ? suggestions : [];

  return { inputValue, setInput, suggestions: visibleSuggestions, isSearching, error, clearSuggestions };
}
