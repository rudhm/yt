import './VideoCard.css';

function VideoCard({ video, onClick }) {
  const { snippet, id } = video;
  const videoId = id.videoId || id;
  const thumbnailUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
  const publishedDate = snippet.publishedAt
    ? new Date(snippet.publishedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <button type="button" className="video-card" onClick={() => onClick(videoId)}>
      <div className="thumbnail-container">
        <img 
          src={thumbnailUrl} 
          alt={snippet.title}
          className="thumbnail"
          loading="lazy"
        />
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

export default VideoCard;
