import { useEffect, useRef } from 'react';
import './VideoPlayer.css';

function VideoPlayer({ videoId, onClose }) {
  const playerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!videoId) return null;
  const pipedInstance = (import.meta.env.VITE_PIPED_INSTANCE || 'https://piped.mha.fi').replace(/\/$/, '');

  return (
    <div className="video-player-overlay" onClick={onClose}>
      <div className="video-player-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="player-wrapper">
          <iframe
            ref={playerRef}
            className="video-iframe"
            width="560"
            height="315"
            src={`${pipedInstance}/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="video-shield" />
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
