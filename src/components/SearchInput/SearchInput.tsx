import { useId, useRef, useState } from "react";
import type { SearchResult } from "../../types";

interface SearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  suggestions: SearchResult[];
  isSearching: boolean;
  error: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  /** Called with the chosen MBID when a suggestion is picked. */
  onSelect: (mbid: string) => void;
}

// Accessible autocomplete (WAI-ARIA combobox pattern): the input owns
// aria-expanded / aria-activedescendant, the dropdown is a listbox of options,
// and keyboard users can navigate with ↑/↓, commit with Enter and dismiss with
// Escape. Picking an option submits the guess upstream.
export function SearchInput({
  label,
  placeholder,
  value,
  suggestions,
  isSearching,
  error,
  disabled,
  onChange,
  onSelect,
}: SearchInputProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = suggestions.length > 0 && !disabled;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const choose = (result: SearchResult) => {
    onSelect(result.mbid);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          choose(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onChange("");
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <label htmlFor={baseId} className="mb-1 block text-[12px] font-semibold text-[#3a382e]">
        {label}
      </label>
      <div className="xp-inset flex items-center rounded-sm px-2 py-1.5">
        <span aria-hidden className="mr-1.5 text-[#7f9db9]">🔍</span>
        <input
          ref={inputRef}
          id={baseId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          autoComplete="off"
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-[13px] outline-none disabled:cursor-not-allowed"
        />
        {isSearching && (
          <span className="ml-2 shrink-0 text-[11px] text-[#7f9db9]">recherche…</span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-1 text-[12px] text-feedback-wrong">
          {error}
        </p>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="xp-inset absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-sm py-0.5"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.mbid}
              id={optionId(i)}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                // mousedown (not click) so selection fires before input blur.
                e.preventDefault();
                choose(s);
              }}
              className={`cursor-pointer px-2 py-1 text-[13px] ${
                i === activeIndex ? "bg-xp-select text-white" : "text-[#1a1a1a]"
              }`}
            >
              <span className="font-semibold">{s.title}</span>
              {s.subtitle && (
                <span className={i === activeIndex ? "text-white/80" : "text-[#6b6859]"}>
                  {" "}
                  — {s.subtitle}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
