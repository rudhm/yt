import VideoCard from './VideoCard';
import './VideoGrid.css';

function VideoGrid({
  videos,
  onVideoClick,
  isLoading,
  hasSearched = true,
  emptyMessage = 'No videos found. Try a different search.'
}) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    if (!hasSearched) {
      return (
        <div className="empty-state empty-state-start">
          <p className="empty-state-title">Search for videos without Shorts</p>
          <p className="empty-state-subtitle">Try a topic, channel, or creator to get started.</p>
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
