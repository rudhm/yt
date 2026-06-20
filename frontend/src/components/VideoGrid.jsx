import VideoCard from './VideoCard';
import './VideoGrid.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-thumbnail" />
      <div className="skeleton-info">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

function VideoGrid({
  videos,
  onVideoClick,
  isLoading,
  hasSearched = true,
  emptyMessage = 'No videos found. Try a different search.'
}) {
  if (isLoading) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    if (!hasSearched) {
      return (
        <div className="empty-state empty-state-start">
          <span className="empty-state-icon">🎬</span>
          <p className="empty-state-title">Search for videos without Shorts</p>
          <p className="empty-state-subtitle">Try a topic, channel, or creator name to get started.</p>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard 
          key={video.id.videoId || video.id} 
          video={video}
          onClick={onVideoClick}
        />
      ))}
    </div>
  );
}

export default VideoGrid;
