import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';

import ApiErrorState from '../components/common/ApiErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton, {
  LoadingRegion,
} from '../components/common/Skeleton.jsx';
import {
  primaryButton,
  secondaryButton,
} from '../components/common/buttonClasses.js';

import NotificationItem from '../components/notifications/NotificationItem.jsx';

import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import { useNotifications } from '../hooks/useNotifications.js';
import {
  useRefreshableResource,
} from '../hooks/useRefreshableResource.js';

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService.js';

import {
  getMutationError,
} from '../utils/getMutationError.js';

export default function NotificationsPage() {
  const [params, setParams] =
    useSearchParams();

  const filter =
    params.get('filter') === 'unread'
      ? 'unread'
      : 'all';

  const page = Math.min(
    10000,
    Math.max(
      1,
      Number.parseInt(
        params.get('page') ?? '1',
        10
      ) || 1
    )
  );

  const {
    unreadCount,
    refresh: refreshBadge,
  } = useNotifications();

  const [actionError, setActionError] =
    useState('');

  const fetcher = useCallback(
    (signal) =>
      getNotifications(
        {
          page,
          limit: 20,
          filter,
        },
        signal
      ),
    [page, filter]
  );

  const {
    status,
    data,
    error,
    refresh,
    reload,
  } = useRefreshableResource(
    fetcher
  );

  const run = async (fn) => {
    setActionError('');

    try {
      await fn();
    } catch (error) {
      setActionError(
        getMutationError(error)
          .message
      );
    }

    refresh();
    refreshBadge();
  };

  const update = (patch) => {
    setParams((previous) => {
      const next =
        new URLSearchParams(
          previous
        );

      for (const [
        key,
        value,
      ] of Object.entries(patch)) {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }

      return next;
    });
  };

  const renderBody = () => {
    if (
      status ===
      REQUEST_STATUS.LOADING
    ) {
      return (
        <LoadingRegion
          label="Loading notifications…"
          className="space-y-2"
        >
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </LoadingRegion>
      );
    }

    if (
      status === REQUEST_STATUS.ERROR
    ) {
      return (
        <ApiErrorState
          error={error}
          subject="notifications"
          onRetry={reload}
        />
      );
    }

    if (
      data.items.length === 0 &&
      data.pagination.total > 0
    ) {
      return (
        <EmptyState
          title="This page is empty"
          message="There are no notifications on this page."
        >
          <button
            type="button"
            onClick={() =>
              update({ page: '' })
            }
            className={primaryButton}
          >
            Go to first page
          </button>
        </EmptyState>
      );
    }

    if (data.items.length === 0) {
      return (
        <EmptyState
          title={
            filter === 'unread'
              ? 'No unread notifications'
              : 'No notifications yet'
          }
          message={
            filter === 'unread'
              ? "You're all caught up."
              : 'Updates about your courses will appear here.'
          }
          icon="bell"
        />
      );
    }

    return (
      <>
        <section className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
          <div className="border-b border-[#2A2A2A] bg-[#171717] px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              Notification Feed
            </span>
          </div>

          <ul>
            {data.items.map(
              (notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={
                    notification
                  }
                  onOpen={(item) => {
                    if (!item.isRead) {
                      run(() =>
                        markNotificationRead(
                          item.id
                        )
                      );
                    }
                  }}
                  onMarkRead={(item) =>
                    run(() =>
                      markNotificationRead(
                        item.id
                      )
                    )
                  }
                  onDelete={(item) =>
                    run(() =>
                      deleteNotification(
                        item.id
                      )
                    )
                  }
                />
              )
            )}
          </ul>
        </section>

        <Pagination
          page={
            data.pagination.page
          }
          totalPages={
            data.pagination.totalPages
          }
          onPageChange={(nextPage) =>
            update({
              page:
                nextPage > 1
                  ? String(nextPage)
                  : '',
            })
          }
        />
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF3E00]">
              System
            </span>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Course updates and account activity.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              role="group"
              aria-label="Filter"
              className="inline-flex border border-[#2A2A2A] bg-[#111111] p-1"
            >
              {[
                ['all', 'All'],
                ['unread', 'Unread'],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={
                      filter === value
                    }
                    onClick={() =>
                      update({
                        filter:
                          value === 'all'
                            ? ''
                            : value,
                        page: '',
                      })
                    }
                    className={`min-h-9 flex-1 px-4 text-xs font-semibold transition sm:flex-none ${
                      filter === value
                        ? 'bg-[#FF3E00] text-white'
                        : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                run(
                  markAllNotificationsRead
                )
              }
              disabled={unreadCount === 0}
              className={`${secondaryButton} w-full sm:w-auto`}
            >
              Mark all as read
            </button>
          </div>
        </div>
      </header>

      {actionError && (
        <div
          role="alert"
          className="border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </div>
      )}

      {renderBody()}
    </div>
  );
}

