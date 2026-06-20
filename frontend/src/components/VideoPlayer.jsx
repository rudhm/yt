import { useEffect, useState, useCallback } from 'react';
import './VideoPlayer.css';

function VideoPlayer({ video, onClose, onWatchLater, isInWatchLater }) {
  const [copied, setCopied] = useState(false);

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [handleEscape]);

  if (!video) return null;

  const videoId = video.id?.videoId || video.id;
  const videoTitle = video.snippet?.title;

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(youtubeWatchUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = youtubeWatchUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="video-player-overlay" onClick={onClose}>
      <div className="video-player-container" onClick={(e) => e.stopPropagation()}>
        {/* Top bar with title and actions */}
        <div className="player-top-bar">
          <button className="close-button" onClick={onClose} aria-label="Close player">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          {videoTitle && (
            <h2 className="player-title">{videoTitle}</h2>
          )}
          <div className="player-actions">
            <button
              className={`player-action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title="Copy video link"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy link
                </>
              )}
            </button>
            {onWatchLater && (
              <button
                className={`player-action-btn ${isInWatchLater?.(videoId) ? 'active' : ''}`}
                onClick={() => onWatchLater(video)}
                title={isInWatchLater?.(videoId) ? 'Remove from Watch Later' : 'Add to Watch Later'}
              >
                {isInWatchLater?.(videoId) ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Watch Later
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="player-wrapper">
          <iframe
            className="video-iframe"
            width="560"
            height="315"
            src={youtubeEmbedUrl}
            title={videoTitle || 'YouTube video player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Keyboard hint */}
        <div className="player-hint">
          Press <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
