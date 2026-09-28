import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import ApiErrorState from '../components/common/ApiErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Skeleton, { LoadingRegion } from '../components/common/Skeleton.jsx';
import { primaryButton } from '../components/common/buttonClasses.js';
import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import { useRefreshableResource } from '../hooks/useRefreshableResource.js';
import { getMyActivity } from '../services/activityService.js';
import { activityLabel, formatRelativeTime, safeLink } from '../utils/notificationUtils.js';
import { ROUTES } from '../utils/paths.js';

export default function ActivityPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1));
  const { status, data, error, reload } = useRefreshableResource(useCallback((signal) => getMyActivity({ page, limit: 20 }, signal), [page]));
  const goTo = (p) => setParams(p > 1 ? { page: String(p) } : {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-slate-600">Your recent learning activity. Only you can see this.</p>
      </div>

      {status === REQUEST_STATUS.LOADING && <LoadingRegion label="Loading activity…" className="space-y-2"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></LoadingRegion>}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="activity" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS && (data.items.length === 0 ? (
        <EmptyState title="No activity yet" message="Your enrollments, lessons and quizzes will show up here.">
          <Link to={ROUTES.courses} className={primaryButton}>Browse courses</Link>
        </EmptyState>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {data.items.map((a) => {
              const to = safeLink(a.link);
              const inner = (
                <>
                  <span className="block wrap-break-word text-sm font-medium text-slate-900">{activityLabel(a)}</span>
                  <span className="block text-xs text-slate-600">{a.courseTitle ? `${a.courseTitle} · ` : ''}<time dateTime={a.createdAt}>{formatRelativeTime(a.createdAt)}</time></span>
                </>
              );
              return <li key={a.id}>{to ? <Link to={to} className="block px-4 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600">{inner}</Link> : <div className="px-4 py-3">{inner}</div>}</li>;
            })}
          </ul>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={goTo} />
        </>
      ))}
    </div>
  );
}