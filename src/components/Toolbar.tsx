import { useRef } from 'react';
import LoadingIndicator from './LoadingIndicator';

interface ToolbarProps {
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isSecure: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onStop: () => void;
  onToggleAI?: () => void;
  isAIChatOpen?: boolean;
}

export default function Toolbar({
  url,
  isLoading,
  canGoBack,
  canGoForward,
  isSecure,
  inputValue,
  onInputChange,
  onSubmit,
  onBack,
  onForward,
  onReload,
  onStop,
  onToggleAI,
  isAIChatOpen
}: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
    inputRef.current?.blur();
  };

  const focusAndSelect = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when input receives focus (Chrome-like)
    e.target.select();
  };

  // Expose focus method for parent
  (window as any).focusOmnibox = focusAndSelect;

  return (
    <div className="toolbar">
      <button
        className="nav-button"
        onClick={onBack}
        disabled={!canGoBack}
        title="Back"
        aria-label="Go back"
      >
        ←
      </button>
      
      <button
        className="nav-button"
        onClick={onForward}
        disabled={!canGoForward}
        title="Forward"
        aria-label="Go forward"
      >
        →
      </button>
      
      <button
        className="nav-button"
        onClick={isLoading ? onStop : onReload}
        title={isLoading ? "Stop" : "Reload"}
        aria-label={isLoading ? "Stop loading" : "Reload page"}
      >
        {isLoading ? '✕' : '↻'}
      </button>
      
      <form onSubmit={handleSubmit} className="omnibox-container">
        <input
          ref={inputRef}
          type="text"
          className="omnibox"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search or enter URL"
          spellCheck={false}
          autoComplete="off"
        />
        <LoadingIndicator isLoading={isLoading} />
      </form>

      {onToggleAI && (
        <button
          className={`ai-button ${isAIChatOpen ? 'active' : ''}`}
          onClick={onToggleAI}
          title="AI Agent (Cmd/Ctrl+K)"
          aria-label="Toggle AI Agent"
        >
          🤖
        </button>
      )}
    </div>
  );
}
