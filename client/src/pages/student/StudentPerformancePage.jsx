import { Link } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState.jsx';
import ActivityChart from '../../components/analytics/ActivityChart.jsx';
import QuizPerformanceTable from '../../components/analytics/QuizPerformanceTable.jsx';
import RangeSelector from '../../components/analytics/RangeSelector.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import Button from '../../components/common/Button.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import { PageHeader, Panel } from '../../components/dashboard/DashboardUi.jsx';

import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useAnalyticsRange } from '../../hooks/useAnalyticsRange.js';
import {
  useStudentActivity,
  useStudentCourses,
  useStudentOverview,
  useStudentQuizzes,
} from '../../hooks/useStudentAnalytics.js';

import { ROUTES } from '../../utils/paths.js';

function PerformanceSkeleton() {
  return (
    <LoadingRegion
      label="Loading your performance..."
      className="space-y-6"
    >
      <Skeleton className="h-28 w-full" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-full"
          />
        ))}
      </div>

      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
    </LoadingRegion>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mono-label text-[#FF3E00]">
      {children}
    </p>
  );
}

function CoursePerformanceRow({ entry }) {
  const total = entry.totalConcepts ?? 0;
  const completed = entry.completedConcepts ?? 0;

  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return (
    <li className="group border-b border-neutral-800 py-5 last:border-b-0 sm:py-6">
      <div className="flex flex-col gap-4">
        {/* COURSE HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-5 shrink-0 bg-neutral-700 transition-colors group-hover:bg-[#FF3E00]" />

              <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white transition-colors group-hover:text-[#FF3E00] sm:text-lg">
                {entry.course.title}
              </h3>
            </div>
          </div>

          <Button
            as={Link}
            to={ROUTES.course(entry.course.id)}
            variant="secondary"
            size="sm"
            className="w-full justify-center sm:w-auto"
          >
            Continue
          </Button>
        </div>

        {/* PROGRESS */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Course Progress
            </span>

            <span className="font-mono text-[10px] font-bold text-[#FF3E00]">
              {percentage}%
            </span>
          </div>

          <ProgressBar
            value={completed}
            max={total}
            showLabel={false}
          />
        </div>

        {/* QUIZ METRICS */}
        {entry.quizAttempts > 0 && (
          <div className="grid grid-cols-3 gap-2 border-t border-neutral-800 pt-3 sm:max-w-xl sm:gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-600 sm:text-[10px]">
                Attempts
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-300">
                {entry.quizAttempts}
              </p>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-600 sm:text-[10px]">
                Avg Score
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-300">
                {entry.averageQuizScore}%
              </p>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-600 sm:text-[10px]">
                Pass Rate
              </p>

              <p className="mt-1 text-sm font-semibold text-[#22C55E]">
                {entry.quizPassRate}%
              </p>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function PerformanceStatCard({
  label,
  value,
  hint,
}) {
  return (
    <div className="group relative overflow-hidden border border-neutral-800 bg-[#111111] p-4 transition-all duration-200 hover:border-[#3A3A3A] sm:p-5">
      <p className="mono-label truncate">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl">
        {value}
      </p>

      {hint && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500 sm:text-sm">
          {hint}
        </p>
      )}

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF3E00] transition-all duration-300 group-hover:w-full" />
    </div>
  );
}

export default function StudentPerformancePage() {
  const { range, setRange } = useAnalyticsRange();

  const overview = useStudentOverview();
  const courses = useStudentCourses();
  const quizzes = useStudentQuizzes();
  const activity = useStudentActivity(range);

  if (overview.status === REQUEST_STATUS.LOADING) {
    return <PerformanceSkeleton />;
  }

  if (overview.status === REQUEST_STATUS.ERROR) {
    return (
      <ApiErrorState
        error={overview.error}
        subject="performance"
        onRetry={overview.reload}
      />
    );
  }

  const { data } = overview;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* PAGE HEADER */}
      <section className="reveal">
        <div className="border-b border-neutral-800 pb-6 sm:pb-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-6 bg-[#FF3E00] sm:w-8" />

            <SectionLabel>
              STUDENT / PERFORMANCE
            </SectionLabel>
          </div>

          <PageHeader
            title="My Performance"
            description="Your own learning and quiz performance, calculated from your activity."
          />
        </div>
      </section>

      {/* OVERVIEW STATS */}
      <section className="reveal">
        <div className="mb-4">
          <p className="mono-label">
            PERFORMANCE OVERVIEW
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <PerformanceStatCard
            label="Courses"
            value={data.coursesWithProgress}
            hint="Courses with progress"
          />

          <PerformanceStatCard
            label="Concepts"
            value={data.conceptsCompleted}
            hint={`${data.conceptsRemaining} remaining`}
          />

          <PerformanceStatCard
            label="Quiz Attempts"
            value={data.quizzes.totalAttempts}
            hint={`${data.quizzes.averageScore}% average`}
          />

          <PerformanceStatCard
            label="Quizzes Passed"
            value={data.quizzes.passedCount}
            hint={`${data.quizzes.failedCount} failed`}
          />
        </div>
      </section>

      {/* CONTINUE LEARNING */}
      {data.recentActivity && (
        <section className="reveal">
          <Panel
            title="Continue learning"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="mono-label text-[#FF3E00]">
                  LAST SESSION
                </p>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-300">
                  Last opened:{' '}
                  <span className="font-semibold text-white">
                    {data.recentActivity.courseTitle}
                  </span>
                </p>
              </div>

              <Button
                as={Link}
                to={ROUTES.learn(
                  data.recentActivity.courseId,
                  data.recentActivity.resourceId
                )}
                className="w-full justify-center sm:w-auto"
              >
                Continue Learning
              </Button>
            </div>
          </Panel>
        </section>
      )}

      {/* COURSE PROGRESS */}
      <section className="reveal">
        <Panel title="Course progress">
          {courses.status === REQUEST_STATUS.LOADING && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {courses.status === REQUEST_STATUS.ERROR && (
            <ApiErrorState
              error={courses.error}
              subject="course performance"
              onRetry={courses.reload}
            />
          )}

          {courses.status === REQUEST_STATUS.SUCCESS && (
            courses.data.length === 0 ? (
              <AnalyticsEmptyState message="No course activity yet." />
            ) : (
              <ul>
                {courses.data.map((entry) => (
                  <CoursePerformanceRow
                    key={entry.course.id}
                    entry={entry}
                  />
                ))}
              </ul>
            )
          )}
        </Panel>
      </section>

      {/* QUIZ PERFORMANCE */}
      <section className="reveal">
        <Panel title="Quiz performance">
          {quizzes.status === REQUEST_STATUS.LOADING && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {quizzes.status === REQUEST_STATUS.ERROR && (
            <ApiErrorState
              error={quizzes.error}
              subject="quiz performance"
              onRetry={quizzes.reload}
            />
          )}

          {quizzes.status === REQUEST_STATUS.SUCCESS && (
            quizzes.data.length === 0 ? (
              <AnalyticsEmptyState message="No quiz attempts yet." />
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <QuizPerformanceTable
                    quizzes={quizzes.data}
                  />
                </div>
              </div>
            )
          )}
        </Panel>
      </section>

      {/* LEARNING ACTIVITY */}
      <section className="reveal">
        <Panel
          title="Learning activity"
          actions={
            <div className="w-full sm:w-auto">
              <RangeSelector
                value={range}
                onChange={setRange}
              />
            </div>
          }
        >
          {activity.status === REQUEST_STATUS.LOADING && (
            <Skeleton className="h-64 w-full" />
          )}

          {activity.status === REQUEST_STATUS.ERROR && (
            <ApiErrorState
              error={activity.error}
              subject="activity"
              onRetry={activity.reload}
            />
          )}

          {activity.status === REQUEST_STATUS.SUCCESS && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[560px]">
                <ActivityChart
                  series={activity.data.series}
                  title="Your learning activity"
                  emptyMessage="No learning activity yet."
                  lines={[
                    {
                      key: 'conceptCompletions',
                      label: 'Completions',
                      color: '#FF3E00',
                    },
                    {
                      key: 'quizAttempts',
                      label: 'Quiz attempts',
                      color: '#F59E0B',
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}

