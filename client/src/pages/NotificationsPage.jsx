import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import ApiErrorState from '../components/common/ApiErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton, { LoadingRegion } from '../components/common/Skeleton.jsx';
import { primaryButton, secondaryButton } from '../components/common/buttonClasses.js';
import NotificationItem from '../components/notifications/NotificationItem.jsx';
import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { useRefreshableResource } from '../hooks/useRefreshableResource.js';
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationService.js';
import { getMutationError } from '../utils/getMutationError.js';

// Used under both the public layout and the dashboards. State lives in the URL: ?filter=unread&page=2.
export default function NotificationsPage() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') === 'unread' ? 'unread' : 'all';
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1));
  const { unreadCount, refresh: refreshBadge } = useNotifications();
  const [actionError, setActionError] = useState('');

  const fetcher = useCallback((signal) => getNotifications({ page, limit: 20, filter }, signal), [page, filter]);
  const { status, data, error, refresh, reload } = useRefreshableResource(fetcher);

  const run = async (fn) => {
    setActionError('');
    try { await fn(); } catch (e) { setActionError(getMutationError(e).message); }
    refresh();
    refreshBadge();
  };
  const update = (patch) => setParams((prev) => { const next = new URLSearchParams(prev); for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k)); return next; });

  const renderBody = () => {
    if (status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading notifications…" className="space-y-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></LoadingRegion>;
    if (status === REQUEST_STATUS.ERROR) return <ApiErrorState error={error} subject="notifications" onRetry={reload} />;
    if (data.items.length === 0 && data.pagination.total > 0) return <EmptyState title="This page is empty" message="There are no notifications on this page."><button type="button" onClick={() => update({ page: '' })} className={primaryButton}>Go to the first page</button></EmptyState>;
    if (data.items.length === 0) return <EmptyState title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'} message={filter === 'unread' ? "You're all caught up." : 'Updates about your courses will appear here.'} icon="bell" />;
    return (
      <>
        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {data.items.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onOpen={(item) => { if (!item.isRead) run(() => markNotificationRead(item.id)); }}
              onMarkRead={(item) => run(() => markNotificationRead(item.id))}
              onDelete={(item) => run(() => deleteNotification(item.id))}
            />
          ))}
        </ul>
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(p) => update({ page: p > 1 ? String(p) : '' })} />
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
            {[['all', 'All'], ['unread', 'Unread']].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => update({ filter: value === 'all' ? '' : value, page: '' })} className={`rounded px-3 py-1.5 text-sm font-medium ${filter === value ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>{label}</button>
            ))}
          </div>
          <button type="button" onClick={() => run(markAllNotificationsRead)} disabled={unreadCount === 0} className={secondaryButton}>Mark all as read</button>
        </div>
      </div>
      {actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
      {renderBody()}
    </div>
  );
}