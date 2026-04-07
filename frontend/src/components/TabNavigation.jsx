import './TabNavigation.css';

function TabNavigation({ activeTab, onTabChange, isAuthenticated }) {
  return (
    <div className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        <span className="tab-icon">🔍</span>
        Search
      </button>
      <button
        className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''} ${!isAuthenticated ? 'disabled' : ''}`}
        onClick={() => isAuthenticated && onTabChange('subscriptions')}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? 'Sign in to view subscriptions' : ''}
      >
        <span className="tab-icon">📺</span>
        Subscriptions
        {!isAuthenticated && <span className="lock-icon">🔒</span>}
      </button>
    </div>
  );
}

export default TabNavigation;
