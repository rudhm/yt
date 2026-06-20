import { useEffect, useRef } from 'react';

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useKeyboardShortcuts(shortcuts) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (IGNORED_TAGS.has(event.target.tagName)) return;

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : true;

        if (
          ctrlMatch &&
          event.key.toLowerCase() === shortcut.key.toLowerCase()
        ) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
