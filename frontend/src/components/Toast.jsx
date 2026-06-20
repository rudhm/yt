import { createContext, useContext, useState, useCallback, useRef } from 'react';
import './Toast.css';

const ICONS = {
  info: 'ℹ',
  success: '✓',
  error: '✕',
};

const ToastContext = createContext(null);

let nextId = 0;

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  const handleExit = useCallback(() => {
    setExiting(true);
    // Wait for the fade-out animation to finish before removing from DOM.
    setTimeout(() => onRemove(toast.id), 150);
  }, [toast.id, onRemove]);

  // Auto-dismiss timer.
  const timerRef = useRef(null);
  if (!timerRef.current) {
    timerRef.current = setTimeout(handleExit, toast.duration);
  }

  return (
    <div
      className={`toast toast-${toast.type}${exiting ? ' toast-exiting' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return showToast;
}
