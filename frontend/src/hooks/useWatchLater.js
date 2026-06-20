import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const getVideoId = (video) => video.id?.videoId || video.id;

export function useWatchLater() {
  const [watchLater, setWatchLater] = useLocalStorage('lapop-watch-later', []);

  const addToWatchLater = useCallback(
    (video) => {
      const id = getVideoId(video);
      setWatchLater((prev) => {
        if (prev.some((v) => getVideoId(v) === id)) return prev;
        return [video, ...prev];
      });
    },
    [setWatchLater]
  );

  const removeFromWatchLater = useCallback(
    (videoId) => {
      setWatchLater((prev) => prev.filter((v) => getVideoId(v) !== videoId));
    },
    [setWatchLater]
  );

  const isInWatchLater = useCallback(
    (videoId) => watchLater.some((v) => getVideoId(v) === videoId),
    [watchLater]
  );

  const clearWatchLater = useCallback(() => {
    setWatchLater([]);
  }, [setWatchLater]);

  return {
    watchLater,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
    clearWatchLater,
  };
}
