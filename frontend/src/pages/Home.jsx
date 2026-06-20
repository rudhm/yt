import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useWatchLater } from '../hooks/useWatchLater';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useToast } from '../components/Toast';
import SearchBar from '../components/SearchBar';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import TabNavigation from '../components/TabNavigation';
import SubscriptionsFeed from '../components/SubscriptionsFeed';
import { searchVideos, searchLongVideos } from '../utils/api';
import './Home.css';

function Home() {
  const [activeTab, setActiveTab] = useState('search');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null); // { id, title }
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Duration Filter
  const [filterType, setFilterType] = useState('noshorts'); // 'noshorts' or 'long'

  const { isAuthenticated } = useAuth();
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { watchLater, addToWatchLater, removeFromWatchLater, isInWatchLater } = useWatchLater();
  const { showToast } = useToast();

  const performSearch = async (query, type, pageToken = null, isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true);
      setError(null);
      setSearchQuery(query);
      setVideos([]);
    } else {
      setIsLoadingMore(true);
    }
    setNextPageToken(null);

    try {
      const data = type === 'long' 
        ? await searchLongVideos(query, 20) // Note: searchLongVideos doesn't currently accept pageToken in api.js, let's just pass what it can
        : await searchVideos(query, 20, pageToken);

      setVideos(prev => isLoadMore ? [...prev, ...(data.items || [])] : (data.items || []));
      setNextPageToken(data.nextPageToken || null);
      
      if (!isLoadMore && data.items?.length === 0) {
        setError('No videos found. Try a different search.');
      }
      
      if (!isLoadMore && query.trim()) {
        addSearch(query.trim());
      }
    } catch (err) {
      console.error('Search failed:', err);
      if (!isLoadMore) {
        setError(
          err.response?.data?.error || 
          'Failed to search videos. Make sure the backend is running and API key is configured.'
        );
        setVideos([]);
      }
    } finally {
      if (!isLoadMore) setIsLoading(false);
      else setIsLoadingMore(false);
    }
  };

  const handleSearch = (query) => {
    performSearch(query, filterType);
  };

  const handleLoadMore = useCallback(() => {
    if (!nextPageToken || isLoadingMore || isLoading || activeTab !== 'search') return;
    performSearch(searchQuery, filterType, nextPageToken, true);
  }, [nextPageToken, isLoadingMore, isLoading, searchQuery, filterType, activeTab]);

  useInfiniteScroll(handleLoadMore, { enabled: activeTab === 'search' && !!nextPageToken && !isLoading && !isLoadingMore });

  const handleFilterChange = (newType) => {
    if (newType !== filterType) {
      setFilterType(newType);
      if (searchQuery) {
        performSearch(searchQuery, newType);
      }
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handleWatchLaterToggle = (video) => {
    const videoId = video.id.videoId || video.id;
    if (isInWatchLater(videoId)) {
      removeFromWatchLater(videoId);
      showToast('Removed from Watch Later', 'info');
    } else {
      addToWatchLater(video);
      showToast('Added to Watch Later', 'success');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: '/',
      handler: (e) => {
        e.preventDefault();
        window.dispatchEvent(new Event('focus-search'));
      },
      description: 'Focus search bar'
    }
  ]);

  return (
    <div className="home-page">
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAuthenticated={isAuthenticated}
        watchLaterCount={watchLater.length}
      />

      {activeTab === 'search' && (
        <>
          <div className="search-section">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              searchHistory={history}
              onRemoveHistory={removeSearch}
              onClearHistory={clearHistory}
            />
            
            <div className="filter-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <button 
                className={`filter-badge ${filterType === 'noshorts' ? 'active' : ''}`}
                style={{ cursor: 'pointer', background: filterType === 'noshorts' ? 'var(--success-bg)' : 'transparent', border: `1px solid ${filterType === 'noshorts' ? 'var(--success-border)' : 'var(--line-color)'}`, color: filterType === 'noshorts' ? 'var(--success)' : 'var(--muted)' }}
                onClick={() => handleFilterChange('noshorts')}
              >
                No Shorts (4m+)
              </button>
              <button 
                className={`filter-badge ${filterType === 'long' ? 'active' : ''}`}
                style={{ cursor: 'pointer', background: filterType === 'long' ? 'var(--success-bg)' : 'transparent', border: `1px solid ${filterType === 'long' ? 'var(--success-border)' : 'var(--line-color)'}`, color: filterType === 'long' ? 'var(--success)' : 'var(--muted)' }}
                onClick={() => handleFilterChange('long')}
              >
                Long Videos (20m+)
              </button>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {searchQuery && !error && (
            <div className="search-info">
              <p>
                Search results for <strong>{searchQuery}</strong>
                {videos.length > 0 && (
                  <span className="results-count"> • {videos.length} videos</span>
                )}
              </p>
            </div>
          )}

          <VideoGrid 
            videos={videos}
            onVideoClick={handleVideoClick}
            onWatchLater={handleWatchLaterToggle}
            isInWatchLater={isInWatchLater}
            isLoading={isLoading && !isLoadMoreData(videos)}
            hasSearched={Boolean(searchQuery)}
          />
          
          {isLoadingMore && (
            <div className="load-more-container">
              <span className="search-spinner" style={{ borderColor: 'var(--muted)', borderTopColor: 'var(--accent)', width: '24px', height: '24px' }}></span>
            </div>
          )}
        </>
      )}

      {activeTab === 'watchlater' && (
        <div style={{ paddingTop: '1.5rem' }}>
          <div className="search-info" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Watch Later</h2>
            <p>Your saved videos. They are stored locally on this device.</p>
          </div>
          <VideoGrid 
            videos={watchLater}
            onVideoClick={handleVideoClick}
            onWatchLater={handleWatchLaterToggle}
            isInWatchLater={isInWatchLater}
            isLoading={false}
            hasSearched={true}
            emptyMessage="Your Watch Later queue is empty. Click the bookmark icon on any video to save it here."
          />
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionsFeed onVideoClick={handleVideoClick} />
      )}

      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo}
          onClose={handleClosePlayer}
          onWatchLater={handleWatchLaterToggle}
          isInWatchLater={isInWatchLater}
        />
      )}
    </div>
  );
}

// Helper to prevent full skeleton re-render on load more
function isLoadMoreData(videos) {
    return videos.length > 0;
}

export default Home;
