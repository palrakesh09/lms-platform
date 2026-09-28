import { Link } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx';
import ActivityChart from '../../components/analytics/ActivityChart.jsx';
import QuizPerformanceTable from '../../components/analytics/QuizPerformanceTable.jsx';
import RangeSelector from '../../components/analytics/RangeSelector.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import { primaryButton } from '../../components/common/buttonClasses.js';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useAnalyticsRange } from '../../hooks/useAnalyticsRange.js';
import { useStudentActivity, useStudentCourses, useStudentOverview, useStudentQuizzes } from '../../hooks/useStudentAnalytics.js';
import { ROUTES } from '../../utils/paths.js';

export default function StudentPerformancePage() {
  const { range, setRange } = useAnalyticsRange();
  const overview = useStudentOverview();
  const courses = useStudentCourses();
  const quizzes = useStudentQuizzes();
  const activity = useStudentActivity(range);

  if (overview.status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading your performance…" className="space-y-4"><Skeleton className="h-24 w-full" /></LoadingRegion>;
  if (overview.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={overview.error} subject="performance" onRetry={overview.reload} />;

  const { data } = overview;

  return (
    <div className="space-y-6">
      <PageHeader title="My Performance" description="Your own learning and quiz performance, calculated from your activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses with progress" value={data.coursesWithProgress} />
        <StatCard label="Concepts completed" value={data.conceptsCompleted} hint={`${data.conceptsRemaining} remaining`} />
        <StatCard label="Quiz attempts" value={data.quizzes.totalAttempts} hint={`${data.quizzes.averageScore}% avg`} />
        <StatCard label="Quizzes passed" value={data.quizzes.passedCount} hint={`${data.quizzes.failedCount} failed`} />
      </div>

      {data.recentActivity && (
        <Panel title="Continue learning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Last opened: <span className="font-medium">{data.recentActivity.courseTitle}</span></p>
            <Link to={ROUTES.learn(data.recentActivity.courseId, data.recentActivity.resourceId)} className={primaryButton}>Continue Learning</Link>
          </div>
        </Panel>
      )}

      <Panel title="Course progress">
        {courses.status === REQUEST_STATUS.LOADING && <Skeleton className="h-24 w-full" />}
        {courses.status === REQUEST_STATUS.ERROR && <ApiErrorState error={courses.error} subject="course performance" onRetry={courses.reload} />}
        {courses.status === REQUEST_STATUS.SUCCESS && (
          courses.data.length === 0 ? <AnalyticsEmptyState message="No course activity yet." /> : (
            <ul className="space-y-4">
              {courses.data.map((entry) => (
                <li key={entry.course.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-medium text-slate-900">{entry.course.title}</h3>
                    <Link to={ROUTES.course(entry.course.id)} className={primaryButton}>Continue Learning</Link>
                  </div>
                  <div className="mt-2"><ProgressBar completed={entry.completedConcepts} total={entry.totalConcepts} /></div>
                  {entry.quizAttempts > 0 && <p className="mt-2 text-xs text-slate-600">Quizzes: {entry.quizAttempts} attempts · {entry.averageQuizScore}% avg · {entry.quizPassRate}% pass</p>}
                </li>
              ))}
            </ul>
          )
        )}
      </Panel>

      <Panel title="Quiz performance">
        {quizzes.status === REQUEST_STATUS.LOADING && <Skeleton className="h-24 w-full" />}
        {quizzes.status === REQUEST_STATUS.ERROR && <ApiErrorState error={quizzes.error} subject="quiz performance" onRetry={quizzes.reload} />}
        {quizzes.status === REQUEST_STATUS.SUCCESS && (quizzes.data.length === 0 ? <AnalyticsEmptyState message="No quiz attempts yet." /> : <QuizPerformanceTable quizzes={quizzes.data} />)}
      </Panel>

      <Panel title="Learning activity" actions={<RangeSelector value={range} onChange={setRange} />}>
        {activity.status === REQUEST_STATUS.LOADING && <Skeleton className="h-64 w-full" />}
        {activity.status === REQUEST_STATUS.ERROR && <ApiErrorState error={activity.error} subject="activity" onRetry={activity.reload} />}
        {activity.status === REQUEST_STATUS.SUCCESS && (
          <ActivityChart series={activity.data.series} title="Your learning activity" emptyMessage="No learning activity yet."
            lines={[{ key: 'conceptCompletions', label: 'Completions', color: '#0ea5e9' }, { key: 'quizAttempts', label: 'Quiz attempts', color: '#f59e0b' }]} />
        )}
      </Panel>
    </div>
  );
}