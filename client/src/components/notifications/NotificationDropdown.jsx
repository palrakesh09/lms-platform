import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Link } from 'react-router';
import {
  REQUEST_STATUS,
  useApiResource,
} from '../../hooks/useApiResource.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService.js';
import Skeleton, {
  LoadingRegion,
} from '../common/Skeleton.jsx';
import NotificationItem from './NotificationItem.jsx';

export default function NotificationDropdown({
  id,
  onClose,
}) {
  const {
    unreadCount,
    refresh,
  } = useNotifications();

  const headingRef = useRef(null);

  const fetcher = useCallback(
    (signal) =>
      getNotifications(
        {
          page: 1,
          limit: 8,
        },
        signal,
      ),
    [],
  );

  const {
    status,
    data,
    reload,
  } = useApiResource(fetcher);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const open = (notification) => {
    onClose();

    if (!notification.isRead) {
      markNotificationRead(
        notification.id,
      ).then(refresh, () => {});
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
    } catch {
      // Keep the current list visible.
    }

    reload();
    refresh();
  };

  return (
    <div
      id={id}
      role="region"
      aria-label="Notifications"
      className="absolute right-0 z-50 mt-2 w-[calc(100vw-1rem)] max-w-sm overflow-hidden border border-neutral-800 bg-[#111111] shadow-2xl sm:w-96"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 bg-[#171717] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#FF3E00]" />

          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white focus:outline-none"
          >
            Notifications
          </h2>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#FF3E00] hover:text-[#FF531F] focus-visible:outline-2 focus-visible:outline-[#FF3E00]"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="max-h-[24rem] overflow-y-auto">
        {status ===
          REQUEST_STATUS.LOADING && (
          <LoadingRegion
            label="Loading notifications…"
            className="space-y-2 p-3"
          >
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </LoadingRegion>
        )}

        {status ===
          REQUEST_STATUS.ERROR && (
          <p
            role="alert"
            className="border-l-2 border-[#EF4444] p-4 text-sm text-[#F87171]"
          >
            Unable to load notifications.

            <button
              type="button"
              onClick={reload}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </p>
        )}

        {status ===
          REQUEST_STATUS.SUCCESS &&
          (data.items.length === 0 ? (
            <p className="px-4 py-8 text-center font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              You're all caught up.
            </p>
          ) : (
            <ul>
              {data.items.map(
                (notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={
                      notification
                    }
                    onOpen={open}
                  />
                ),
              )}
            </ul>
          ))}
      </div>

      {/* FOOTER */}
      <Link
        to="/notifications"
        onClick={onClose}
        className="block border-t border-neutral-800 bg-[#0A0A0A] px-4 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF3E00] transition-colors hover:bg-[#171717] hover:text-[#FF531F] focus-visible:outline-2 focus-visible:outline-[#FF3E00]"
      >
        View all notifications →
      </Link>
    </div>
  );
}