// context/NotificationsProvider.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getUnreadCount } from '../services/notificationService.js';
import { NotificationsContext } from './NotificationsContext.js';

const REFRESH_MS = 120000; // gentle: focus events plus one refetch every 2 minutes while the tab is visible

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setCount(await getUnreadCount());
    } catch {
      /* the badge is best-effort; a failed refresh keeps the last known number */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const initialRefresh = window.setTimeout(refresh, 0);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    const timer = setInterval(onVisible, REFRESH_MS);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(initialRefresh);
      clearInterval(timer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, refresh]);

  const value = useMemo(() => ({ unreadCount: isAuthenticated ? count : 0, refresh }), [isAuthenticated, count, refresh]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}