import './TabNavigation.css';

function TabNavigation({ activeTab, onTabChange, isAuthenticated, watchLaterCount = 0 }) {
  return (
    <div className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Search
      </button>
      <button
        className={`tab-button ${activeTab === 'watchlater' ? 'active' : ''}`}
        onClick={() => onTabChange('watchlater')}
      >
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        Watch Later
        {watchLaterCount > 0 && (
          <span className="tab-badge">{watchLaterCount}</span>
        )}
      </button>
      <button
        className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''} ${!isAuthenticated ? 'disabled' : ''}`}
        onClick={() => isAuthenticated && onTabChange('subscriptions')}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? 'Sign in to view subscriptions' : ''}
      >
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
          <polyline points="17 2 12 7 7 2"/>
        </svg>
        Subscriptions
        {!isAuthenticated && <span className="lock-icon">🔒</span>}
      </button>
    </div>
  );
}

export default TabNavigation;
