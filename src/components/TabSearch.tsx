import { useRef, useEffect } from 'react';

interface TabSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export default function TabSearch({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Search tabs...'
}: TabSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focus method globally for Cmd+F shortcut
  useEffect(() => {
    (window as any).focusTabSearch = () => {
      inputRef.current?.focus();
    };
    return () => {
      delete (window as any).focusTabSearch;
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onChange('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="tab-search">
      <div className="search-icon">🔍</div>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
      />
      {value && (
        <button
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
