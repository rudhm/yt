import VideoCard from './VideoCard';
import './VideoGrid.css';

function VideoGrid({ videos, onVideoClick, isLoading }) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="empty-state">
        <p>No videos found. Try a different search.</p>
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
