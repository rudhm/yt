import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import { searchVideos } from '../utils/api';
import './Home.css';

function Home() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="home-page">
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      
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
