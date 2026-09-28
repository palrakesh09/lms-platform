import { useCallback } from 'react';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import ActivityChart from '../../components/analytics/ActivityChart.jsx';
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx';
import CourseAnalyticsTable from '../../components/analytics/CourseAnalyticsTable.jsx';
import CourseStatusChart from '../../components/analytics/CourseStatusChart.jsx';
import RangeSelector from '../../components/analytics/RangeSelector.jsx';
import RoleDistributionChart from '../../components/analytics/RoleDistributionChart.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';
import { useAdminActivity, useAdminOverview } from '../../hooks/useAdminAnalytics.js';
import { useAnalyticsRange } from '../../hooks/useAnalyticsRange.js';
import { useRefreshableResource } from '../../hooks/useRefreshableResource.js';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { getAdminCourseAnalytics } from '../../services/analyticsService.js';
import { useSearchParams } from 'react-router';

export default function AdminAnalyticsPage() {
  const { range, setRange } = useAnalyticsRange();
  const overview = useAdminOverview();
  const activity = useAdminActivity(range);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const courses = useRefreshableResource(useCallback((signal) => getAdminCourseAnalytics({ page, limit: 10, search }, signal), [page, search]));

  if (overview.status === REQUEST_STATUS.LOADING) {
    return <LoadingRegion label="Loading analytics…" className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></LoadingRegion>;
  }
  if (overview.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={overview.error} subject="analytics" onRetry={overview.reload} />;

  const { data } = overview;

  return (
    <>
      <PageHeader title="Analytics" description="System-wide overview, generated live from the database." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={data.users.total} hint={`${data.users.students} students · ${data.users.mentors} mentors · ${data.users.admins} admins`} />
        <StatCard label="Total courses" value={data.courses.total} hint={`${data.courses.published} published · ${data.courses.draft} draft · ${data.courses.archived} archived`} />
        <StatCard label="Active learners" value={data.activeLearners} hint="Last 30 days" />
        <StatCard label="Quiz attempts" value={data.quizzes.totalSubmittedAttempts} hint={`${data.quizzes.averageScore}% avg · ${data.quizzes.passRate}% pass`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="User roles"><RoleDistributionChart users={data.users} /></Panel>
        <Panel title="Course status"><CourseStatusChart courses={data.courses} /></Panel>
      </div>

      <Panel title="Learning activity" actions={<RangeSelector value={range} onChange={setRange} />} className="mt-6">
        {activity.status === REQUEST_STATUS.LOADING && <Skeleton className="h-64 w-full" />}
        {activity.status === REQUEST_STATUS.ERROR && <ApiErrorState error={activity.error} subject="activity" onRetry={activity.reload} />}
        {activity.status === REQUEST_STATUS.SUCCESS && (
          <ActivityChart
            series={activity.data.series}
            title="Learning activity"
            emptyMessage="No learning activity yet."
            lines={[{ key: 'activeLearners', label: 'Active learners', color: '#4f46e5' }, { key: 'conceptCompletions', label: 'Completions', color: '#0ea5e9' }, { key: 'quizAttempts', label: 'Quiz attempts', color: '#f59e0b' }]}
          />
        )}
      </Panel>

      <Panel title="Course analytics" className="mt-6" actions={<SearchInput id="course-analytics-search" label="Search" defaultValue={search} placeholder="Course title" onSearch={(value) => setSearchParams({ search: value })} />}>
        {courses.status === REQUEST_STATUS.LOADING && <Skeleton className="h-40 w-full" />}
        {courses.status === REQUEST_STATUS.ERROR && <ApiErrorState error={courses.error} subject="course analytics" onRetry={courses.reload} />}
        {courses.status === REQUEST_STATUS.SUCCESS && (
          courses.data.items.length === 0 ? <AnalyticsEmptyState message="No courses match your search." /> : (
            <>
              <CourseAnalyticsTable courses={courses.data.items} />
              <Pagination page={courses.data.pagination.page} totalPages={courses.data.pagination.totalPages} onPageChange={(p) => setSearchParams({ search, page: String(p) })} />
            </>
          )
        )}
      </Panel>
    </>
  );
}