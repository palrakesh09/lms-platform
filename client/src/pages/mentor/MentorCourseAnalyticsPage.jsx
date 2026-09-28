import { useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx';
import QuizSummaryBar from '../../components/analytics/QuizSummaryBar.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useMentorCourseAnalytics } from '../../hooks/useMentorAnalytics.js';
import { formatDate } from '../../utils/formatters.js';

export default function MentorCourseAnalyticsPage() {
  const { courseId } = useParams();
  const { status, data, error, reload } = useMentorCourseAnalytics(courseId);

  if (status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading course analytics…" className="space-y-4"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-40 w-full" /></LoadingRegion>;
  if (status === REQUEST_STATUS.ERROR) return <ApiErrorState error={error} subject="course analytics" onRetry={reload} />;

  return (
    <>
      <PageHeader title={`Analytics — ${data.course.title}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active learners" value={data.activeLearners} hint="Last 30 days" />
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><ProgressBar completed={data.overallProgress} total={100} label="Overall course progress" /></div>
        <StatCard label="Concept completion rate" value={`${data.conceptCompletionRate}%`} />
      </div>

      <Panel title="Quiz performance" className="mt-6"><QuizSummaryBar {...data.quizzes} attempts={data.quizzes.attempts} /></Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Most accessed concepts">
          {data.mostAccessedConcepts.length === 0 ? <AnalyticsEmptyState message="No access activity yet." /> : (
            <ul className="space-y-1 text-sm">{data.mostAccessedConcepts.map((c) => <li key={c.conceptId} className="flex justify-between"><span>{c.title}</span><span className="font-medium">{c.accessCount}</span></li>)}</ul>
          )}
        </Panel>
        <Panel title="Most completed concepts">
          {data.mostCompletedConcepts.length === 0 ? <AnalyticsEmptyState message="No completions yet." /> : (
            <ul className="space-y-1 text-sm">{data.mostCompletedConcepts.map((c) => <li key={c.conceptId} className="flex justify-between"><span>{c.title}</span><span className="font-medium">{c.completedCount}</span></li>)}</ul>
          )}
        </Panel>
      </div>

      <Panel title="Concepts with low activity" description="Published concepts with no recorded access yet." className="mt-6">
        {data.lowActivityConcepts.length === 0 ? <p className="text-sm text-slate-600">Every published concept has been accessed at least once.</p> : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{data.lowActivityConcepts.map((c) => <li key={c.conceptId}>{c.title}</li>)}</ul>
        )}
      </Panel>

      <Panel title="Recent learning activity" className="mt-6">
        {data.recentActivity.length === 0 ? <AnalyticsEmptyState message="No recent activity yet." /> : (
          <ul className="divide-y divide-slate-100 text-sm">{data.recentActivity.map((row, i) => (
            <li key={i} className="flex justify-between py-2"><span>{row.completed ? 'Concept completed' : 'Concept accessed'}</span><span className="text-slate-600">{formatDate(row.lastAccessedAt)}</span></li>
          ))}</ul>
        )}
      </Panel>
    </>
  );
}