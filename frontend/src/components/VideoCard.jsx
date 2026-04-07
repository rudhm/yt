import './VideoCard.css';

function VideoCard({ video, onClick }) {
  const { snippet, id } = video;
  const videoId = id.videoId || id;
  const thumbnailUrl = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;

  return (
    <div className="video-card" onClick={() => onClick(videoId)}>
      <div className="thumbnail-container">
        <img 
          src={thumbnailUrl} 
          alt={snippet.title}
          className="thumbnail"
        />
      </div>
      <div className="video-info">
        <h3 className="video-title">{snippet.title}</h3>
        <p className="channel-name">{snippet.channelTitle}</p>
        <p className="video-description">
          {snippet.description?.substring(0, 100)}
          {snippet.description?.length > 100 ? '...' : ''}
        </p>
      </div>
    </div>
  );
}

export default VideoCard;
