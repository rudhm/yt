import { memo } from 'react';
import './VideoCard.css';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

function VideoCard({ video, onClick, onWatchLater, isInWatchLater }) {
  const { snippet, id } = video;
  const videoId = id.videoId || id;
  const thumbnailUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
  const publishedDate = snippet.publishedAt
    ? dateFormatter.format(new Date(snippet.publishedAt))
    : null;

  const handleWatchLater = (e) => {
    e.stopPropagation();
    if (onWatchLater) {
      onWatchLater(video);
    }
  };

  const inWatchLater = isInWatchLater?.(videoId);

  return (
    <button type="button" className="video-card" onClick={() => onClick(video)}>
      <div className="thumbnail-container">
        <img 
          src={thumbnailUrl} 
          alt={snippet.title}
          className="thumbnail"
          loading="lazy"
        />
        <div className="play-overlay" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        {onWatchLater && (
          <button
            type="button"
            className={`watch-later-btn ${inWatchLater ? 'active' : ''}`}
            onClick={handleWatchLater}
            title={inWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
            aria-label={inWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
          >
            {inWatchLater ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{snippet.title}</h3>
        <p className="video-meta">
          <span>{snippet.channelTitle}</span>
          {publishedDate && <span>• {publishedDate}</span>}
        </p>
        <p className="video-description">{snippet.description || 'No description available.'}</p>
      </div>
    </button>
  );
}

export default memo(VideoCard);
