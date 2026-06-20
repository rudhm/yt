import { useEffect, useRef } from 'react';

export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 300, enabled = true } = options;
  const callbackRef = useRef(callback);
  const cooldownRef = useRef(false);

  // Always point at the latest callback without re-attaching the listener.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (cooldownRef.current) return;

      const scrollBottom =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;

      if (scrollBottom <= threshold) {
        cooldownRef.current = true;
        callbackRef.current();
        setTimeout(() => {
          cooldownRef.current = false;
        }, 200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, enabled]);
}
