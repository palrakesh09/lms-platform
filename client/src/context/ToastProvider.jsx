import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/common/Icon.jsx';
import { ToastContext } from './ToastContext.js';

const DISMISS_AFTER_MS = 5000;

const TONE = {
  success: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  error: 'bg-red-50 text-red-900 ring-red-200',
};

// Short-lived confirmations. Each toast is its own live region (status, or alert for errors).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'success') => {
      nextId.current += 1;
      const id = nextId.current;

      setToasts((current) => [...current, { id, message, type }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DISMISS_AFTER_MS));
    },
    [dismiss],
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ring-inset ${TONE[toast.type]}`}
          >
            <p className="min-w-0 flex-1 break-words">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}