import { Link } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton, secondaryButton } from '../../components/common/buttonClasses.js';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import { PageHeader, Panel, StatCard } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { getAdminStats } from '../../services/adminService.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';

const paths = dashboardPaths('admin');

// All numbers come from one request (GET /api/admin/stats), never from many list calls.
export default function AdminDashboardPage() {
  const { status, data, error, reload } = useApiResource(getAdminStats);

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of courses and users." />

      {status === REQUEST_STATUS.LOADING && (
        <LoadingRegion label="Loading statistics…" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </LoadingRegion>
      )}
      {status === REQUEST_STATUS.ERROR && <ApiErrorState error={error} subject="statistics" onRetry={reload} />}
      {status === REQUEST_STATUS.SUCCESS && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total courses" value={data.courses.total} to={paths.courses} />
            <StatCard label="Published courses" value={data.courses.published} to={`${paths.courses}?status=published`} />
            <StatCard label="Draft courses" value={data.courses.draft} to={`${paths.courses}?status=draft`} />
            <StatCard label="Total users" value={data.users.total} to={paths.users} />
            <StatCard label="Mentors" value={data.users.mentors} to={`${paths.users}?role=mentor`} />
          </div>

          <Panel title="Quick actions">
            <div className="flex flex-wrap gap-3">
              <Link to={paths.newCourse} className={primaryButton}>
                New course
              </Link>
              <Link to={paths.courses} className={secondaryButton}>
                Manage courses
              </Link>
              <Link to={paths.users} className={secondaryButton}>
                Manage users
              </Link>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}