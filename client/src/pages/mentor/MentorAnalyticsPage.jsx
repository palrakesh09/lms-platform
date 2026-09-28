import { Link } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import ActivityChart from '../../components/analytics/ActivityChart.jsx';
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx';
import RangeSelector from '../../components/analytics/RangeSelector.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import { linkButton } from '../../components/common/buttonClasses.js';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useMentorActivity, useMentorOverview } from '../../hooks/useMentorAnalytics.js';
import { useAnalyticsRange } from '../../hooks/useAnalyticsRange.js';
import { dashboardPaths } from '../../utils/dashboardPaths.js';

export default function MentorAnalyticsPage() {
  const { range, setRange } = useAnalyticsRange();
  const overview = useMentorOverview();
  const activity = useMentorActivity(range);
  const paths = dashboardPaths('mentor');

  if (overview.status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading analytics…" className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></LoadingRegion>;
  if (overview.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={overview.error} subject="analytics" onRetry={overview.reload} />;

  const { data } = overview;
  if (data.courses.total === 0) return <AnalyticsEmptyState message="No assigned courses yet." />;

  return (
    <>
      <PageHeader title="Analytics" description="Analytics for the courses you are assigned to." actions={<Link to={paths.courses} className={linkButton}>View my courses</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned courses" value={data.courses.total} hint={`${data.courses.published} published`} />
        <StatCard label="Active learners" value={data.activeLearners} hint="Last 30 days" />
        <StatCard label="Avg. course progress" value={`${data.averageCourseProgress}%`} />
        <StatCard label="Quiz attempts" value={data.quizzes.attempts} hint={`${data.quizzes.averageScore}% avg · ${data.quizzes.passRate}% pass`} />
      </div>

      <Panel title="Learning activity" actions={<RangeSelector value={range} onChange={setRange} />} className="mt-6">
        {activity.status === REQUEST_STATUS.LOADING && <Skeleton className="h-64 w-full" />}
        {activity.status === REQUEST_STATUS.ERROR && <ApiErrorState error={activity.error} subject="activity" onRetry={activity.reload} />}
        {activity.status === REQUEST_STATUS.SUCCESS && (
          <ActivityChart series={activity.data.series} title="Learning activity" emptyMessage="No learning activity yet."
            lines={[{ key: 'activeLearners', label: 'Active learners', color: '#4f46e5' }, { key: 'conceptCompletions', label: 'Completions', color: '#0ea5e9' }, { key: 'quizAttempts', label: 'Quiz attempts', color: '#f59e0b' }]} />
        )}
      </Panel>
    </>
  );
}