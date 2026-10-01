import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

import ApiErrorState from '../components/common/ApiErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton, {
  LoadingRegion,
} from '../components/common/Skeleton.jsx';
import {
  primaryButton,
} from '../components/common/buttonClasses.js';

import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import {
  useRefreshableResource,
} from '../hooks/useRefreshableResource.js';

import {
  getMyActivity,
} from '../services/activityService.js';

import {
  activityLabel,
  formatRelativeTime,
  safeLink,
} from '../utils/notificationUtils.js';

import { ROUTES } from '../utils/paths.js';

export default function ActivityPage() {
  const [params, setParams] =
    useSearchParams();

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
    status,
    data,
    error,
    reload,
  } = useRefreshableResource(
    useCallback(
      (signal) =>
        getMyActivity(
          {
            page,
            limit: 20,
          },
          signal
        ),
      [page]
    )
  );

  const goTo = (nextPage) => {
    setParams(
      nextPage > 1
        ? { page: String(nextPage) }
        : {}
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] pb-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF3E00]">
          Timeline
        </span>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Activity
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Your recent learning activity. Only you can
          see this information.
        </p>
      </header>

      {/* Loading */}
      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion
          label="Loading activity…"
          className="space-y-2"
        >
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </LoadingRegion>
      )}

      {/* Error */}
      {status === REQUEST_STATUS.ERROR && (
        <ApiErrorState
          error={error}
          subject="activity"
          onRetry={reload}
        />
      )}

      {/* Success */}
      {status === REQUEST_STATUS.SUCCESS &&
        (data.items.length === 0 ? (
          <EmptyState
            title="No activity yet"
            message="Your enrollments, lessons and quizzes will show up here."
          >
            <Link
              to={ROUTES.courses}
              className={primaryButton}
            >
              Browse courses
            </Link>
          </EmptyState>
        ) : (
          <>
            <section className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#171717] px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Recent Events
                </span>

                <span className="font-mono text-[10px] text-neutral-700">
                  {data.items.length} records
                </span>
              </div>

              <ul className="divide-y divide-[#222222]">
                {data.items.map((activity) => {
                  const to = safeLink(
                    activity.link
                  );

                  const inner = (
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <span className="block break-words text-sm font-medium text-neutral-200">
                          {activityLabel(
                            activity
                          )}
                        </span>

                        {activity.courseTitle && (
                          <span className="mt-1 block break-words text-xs text-neutral-600">
                            {activity.courseTitle}
                          </span>
                        )}
                      </div>

                      <time
                        dateTime={
                          activity.createdAt
                        }
                        className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-600"
                      >
                        {formatRelativeTime(
                          activity.createdAt
                        )}
                      </time>
                    </div>
                  );

                  return (
                    <li key={activity.id}>
                      {to ? (
                        <Link
                          to={to}
                          className="block px-4 py-4 transition hover:bg-[#171717] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FF3E00] sm:px-5"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="px-4 py-4 sm:px-5">
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <Pagination
              page={
                data.pagination.page
              }
              totalPages={
                data.pagination.totalPages
              }
              onPageChange={goTo}
            />
          </>
        ))}
    </div>
  );
}

