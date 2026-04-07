import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import TabNavigation from '../components/TabNavigation';
import SubscriptionsFeed from '../components/SubscriptionsFeed';
import { searchVideos } from '../utils/api';
import './Home.css';

function Home() {
  const [activeTab, setActiveTab] = useState('search');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);

    try {
      const data = await searchVideos(query);
      setVideos(data.items || []);
      
      if (data.items?.length === 0) {
        setError('No videos found. Try a different search.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError(
        err.response?.data?.error || 
        'Failed to search videos. Make sure the backend is running and API key is configured.'
      );
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    setSelectedVideoId(videoId);
  };

  const handleClosePlayer = () => {
    setSelectedVideoId(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="home-page">
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAuthenticated={isAuthenticated}
      />

      {activeTab === 'search' ? (
        <>
          <div className="search-section">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {searchQuery && !error && (
            <div className="search-info">
              <p>Search results for: <strong>{searchQuery}</strong></p>
              {videos.length > 0 && (
                <p className="filter-badge">✓ Shorts filtered out</p>
              )}
            </div>
          )}

          <VideoGrid 
            videos={videos}
            onVideoClick={handleVideoClick}
            isLoading={isLoading}
          />
        </>
      ) : (
        <SubscriptionsFeed onVideoClick={handleVideoClick} />
      )}

      {selectedVideoId && (
        <VideoPlayer 
          videoId={selectedVideoId}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}

export default Home;
