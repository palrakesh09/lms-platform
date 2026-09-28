import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService.js';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';
import NotificationItem from './NotificationItem.jsx';

// Fetches fresh every time it opens. Focus moves to the heading on open so keyboard users land inside it.
export default function NotificationDropdown({ id, onClose }) {
  const { unreadCount, refresh } = useNotifications();
  const headingRef = useRef(null);
  const fetcher = useCallback((signal) => getNotifications({ page: 1, limit: 8 }, signal), []);
  const { status, data, reload } = useApiResource(fetcher);

  useEffect(() => headingRef.current?.focus(), []);

  const open = (n) => {
    onClose();
    if (!n.isRead) markNotificationRead(n.id).then(refresh, () => {});
  };
  const markAll = async () => {
    try { await markAllNotificationsRead(); } catch { /* keep the list; the count refresh below shows the truth */ }
    reload();
    refresh();
  };

  return (
    <div id={id} role="region" aria-label="Notifications" className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-slate-900 focus:outline-none">Notifications</h2>
        {unreadCount > 0 && <button type="button" onClick={markAll} className="text-xs font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600">Mark all as read</button>}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {status === REQUEST_STATUS.LOADING && <LoadingRegion label="Loading notifications…" className="space-y-2 p-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></LoadingRegion>}
        {status === REQUEST_STATUS.ERROR && (
          <p role="alert" className="p-3 text-sm text-red-600">Unable to load notifications. <button type="button" onClick={reload} className="font-medium underline">Retry</button></p>
        )}
        {status === REQUEST_STATUS.SUCCESS && (data.items.length === 0
          ? <p className="p-4 text-center text-sm text-slate-600">You&apos;re all caught up.</p>
          : <ul>{data.items.map((n) => <NotificationItem key={n.id} notification={n} onOpen={open} />)}</ul>)}
      </div>

      <Link to="/notifications" onClick={onClose} className="block border-t border-slate-200 px-3 py-2 text-center text-sm font-medium text-indigo-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600">
        View all notifications
      </Link>
    </div>
  );
}