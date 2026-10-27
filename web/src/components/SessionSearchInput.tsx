import { Button } from "@nous-research/ui/ui/components/button";
import { Input } from "@nous-research/ui/ui/components/input";
import { IconSearch as Search, IconX as X } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface SessionSearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SessionSearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search sessions…",
  debounceMs = 300,
}: SessionSearchInputProps) {
  // The parent owns `value` and refetches sessions from it, so keystrokes must
  // not reach it one-for-one. Local `text` keeps typing responsive while the
  // effect below notifies the parent at most once per debounce window.
  const [text, setText] = useState(value);
  const [notified, setNotified] = useState(value);

  // Reflect an external reset (the clear button, a back-navigation) immediately.
  // Adjusting during render instead of in an effect avoids painting one frame
  // with the stale local value.
  if (value !== notified) {
    setNotified(value);
    setText(value);
  }

  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setNotified(text);
      onChange(text);
    }, debounceMs);

    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [text, debounceMs, onChange]);

  const handleClear = () => {
    setText("");
    onClear();
  };

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="pl-7 pr-8 h-8 text-sm"
      />
      {text && (
        <Button
          type="button"
          ghost
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
