"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

/**
 * Local state for instant typing feedback; the parent (and therefore the API)
 * only sees the debounced value -> one request per pause, not per keystroke.
 */
function SearchInputBase({ value, onChange, placeholder, label }: SearchInputProps) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, 400);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync when the URL changes externally (e.g. "Clear filters", back button).
  useEffect(() => setText(value), [value]);

  useEffect(() => {
    if (debounced.trim() !== value) onChangeRef.current(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full">
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        icon={<Search className="h-4 w-4" />}
        className="pr-9 [&::-webkit-search-cancel-button]:hidden"
        maxLength={100}
      />
      {text && (
        <button
          type="button"
          onClick={() => setText("")}
          className="absolute inset-y-0 right-2 my-auto flex h-6 w-6 items-center justify-center rounded text-ink-muted hover:bg-slate-100 hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export const SearchInput = memo(SearchInputBase);
