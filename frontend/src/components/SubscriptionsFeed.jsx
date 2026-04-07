import { useState, useEffect } from 'react';
import { getSubscriptionFeed } from '../utils/api';
import VideoGrid from '../components/VideoGrid';
import './SubscriptionsFeed.css';

function SubscriptionsFeed({ onVideoClick }) {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getSubscriptionFeed(20);
        setVideos(data.items || []);
        
        if (data.items?.length === 0) {
          setError('No recent videos from your subscriptions. Try searching instead!');
        }
      } catch (err) {
        console.error('Failed to fetch subscription feed:', err);
        
        if (err.response?.status === 401) {
          setError('Your session expired. Please sign in again.');
        } else {
          setError('Failed to load subscription feed. Please try again later.');
        }
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (error) {
    return (
      <div className="subscriptions-feed">
        <div className="feed-header">
          <h2>📺 Subscription Feed</h2>
          <p className="feed-subtitle">Latest videos from channels you follow (Shorts filtered)</p>
        </div>
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="subscriptions-feed">
      <div className="feed-header">
        <h2>📺 Subscription Feed</h2>
        <p className="feed-subtitle">
          Latest videos from channels you follow (Shorts filtered)
        </p>
        {videos.length > 0 && (
          <div className="feed-stats">
            <span className="filter-badge">✓ {videos.length} videos (Shorts removed)</span>
          </div>
        )}
      </div>

      <VideoGrid 
        videos={videos}
        onVideoClick={onVideoClick}
        isLoading={isLoading}
      />
    </div>
  );
}

export default SubscriptionsFeed;
