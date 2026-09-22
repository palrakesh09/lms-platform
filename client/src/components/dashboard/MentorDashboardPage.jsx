import { Link } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { PageHeader, Panel, StatCard } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { getCourses } from '../../services/courseService.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';
import { linkButton } from '../../components/common/buttonClasses.js';

const paths = dashboardPaths('mentor');
const RECENT_COUNT = 5;

// The API only returns courses this mentor is assigned to, so the total is just the list's pagination total.
const fetchAssignedCourses = (signal) => getCourses({ limit: RECENT_COUNT }, signal);

export default function MentorDashboardPage() {
  const { status, data, error, reload } = useApiResource(fetchAssignedCourses);

  return (
    <>
      <PageHeader title="Dashboard" description="Courses you are assigned to manage." />

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion label="Loading your courses…" className="space-y-4">
          <Skeleton className="h-24 w-full sm:w-64" />
          <Skeleton className="h-40 w-full" />
        </LoadingRegion>
      )}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="courses" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS &&
        (data.pagination.total === 0 ? (
          <EmptyState
            title="No assigned courses"
            message="You haven't been assigned to any courses yet. Ask an administrator to assign you."
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Assigned courses" value={data.pagination.total} to={paths.courses} />
            </div>
            <Panel title="Your courses" actions={<Link to={paths.courses} className={linkButton}>View all</Link>}>
              <ul className="divide-y divide-slate-100">
                {data.items.map((course) => (
                  <li key={course.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="wrap-break-word text-sm font-medium text-slate-900">{course.title}</p>
                      <StatusBadge status={course.status} />
                    </div>
                    <Link to={paths.course(course.id)} className={linkButton}>
                      Manage content<span className="sr-only"> of {course.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        ))}
    </>
  );
}