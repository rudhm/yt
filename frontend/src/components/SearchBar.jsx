import { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, isLoading, searchHistory = [], onRemoveHistory, onClearHistory }) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Expose focus method via ref-like pattern using a global handler
  useEffect(() => {
    const handleFocusSearch = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        setShowHistory(true);
      }
    };
    window.addEventListener('focus-search', handleFocusSearch);
    return () => window.removeEventListener('focus-search', handleFocusSearch);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
    setShowHistory(false);
  };

  const handleInputFocus = () => {
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const filteredHistory = query.trim()
    ? searchHistory.filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;

  return (
    <div className="search-bar-container" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search videos (no Shorts)..."
            aria-label="Search videos"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value && searchHistory.length > 0) {
                setShowHistory(true);
              }
            }}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="search-button"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <span className="search-button-loading">
              <span className="search-spinner" />
              Searching
            </span>
          ) : 'Search'}
        </button>
      </form>

      {/* Search History Dropdown */}
      {showHistory && filteredHistory.length > 0 && (
        <div className="search-history-dropdown">
          <div className="search-history-header">
            <span className="search-history-label">Recent searches</span>
            {onClearHistory && (
              <button className="search-history-clear" onClick={() => { onClearHistory(); setShowHistory(false); }}>
                Clear all
              </button>
            )}
          </div>
          <ul className="search-history-list">
            {filteredHistory.map((item) => (
              <li key={item.query} className="search-history-item">
                <button
                  className="search-history-query"
                  onClick={() => handleHistoryClick(item.query)}
                >
                  <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  <span>{item.query}</span>
                </button>
                {onRemoveHistory && (
                  <button
                    className="search-history-remove"
                    onClick={(e) => { e.stopPropagation(); onRemoveHistory(item.query); }}
                    aria-label={`Remove ${item.query}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="search-history-hint">
            Press <kbd>/</kbd> to focus search
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
