import { Link } from 'react-router';
import ApiErrorState from '../common/ApiErrorState.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import Icon from '../common/Icon.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';
import { REQUEST_STATUS } from '../../hooks/useApiResource.js';
import { useStudentOverview } from '../../hooks/useStudentAnalytics.js';
import { useMyLearning } from '../../hooks/useLearning.js';
import { ROUTES } from '../../utils/paths.js';
import { useAuth } from '../../hooks/useAuth.js';

function StatCard({ label, value, hint, icon }) {
  return (
    <Card
      interactive
      className="group relative overflow-hidden p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="mono-label truncate">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl">
            {value}
          </p>

          {hint && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500 sm:text-sm">
              {hint}
            </p>
          )}
        </div>

        <div className="flex size-9 shrink-0 items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-400 transition-all duration-200 group-hover:border-[#FF3E00] group-hover:text-[#FF3E00] sm:size-10">
          <Icon name={icon} className="size-4 sm:size-5" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF3E00] transition-all duration-300 group-hover:w-full" />
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <LoadingRegion
      label="Loading your dashboard..."
      className="space-y-6"
    >
      <Skeleton className="h-56 w-full sm:h-48" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-full sm:h-32"
          />
        ))}
      </div>

      <Skeleton className="h-80 w-full" />
    </LoadingRegion>
  );
}

function EmptyLearning() {
  return (
    <Card className="p-6 text-center sm:p-8">
      <div className="mx-auto flex size-12 items-center justify-center border border-neutral-800 bg-neutral-900 sm:size-14">
        <Icon
          name="book"
          className="size-5 text-neutral-500 sm:size-6"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white sm:mt-5 sm:text-xl">
        No courses yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        Start learning by exploring the available courses.
      </p>

      <div className="mt-5 sm:mt-6">
        <Button
          as={Link}
          to={ROUTES.courses}
          className="w-full sm:w-auto"
        >
          Explore Courses
          <Icon name="arrow-right" className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

function CourseRow({ entry }) {
  const { course, progress, lastAccessed } = entry;

  const total = progress?.totalConcepts ?? 0;
  const completed = progress?.completedConcepts ?? 0;

  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  const isCompleted = total > 0 && completed >= total;

  return (
    <article className="group border-b border-neutral-800 py-5 last:border-b-0 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={isCompleted ? 'success' : 'accent'}
            >
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>

            <span className="mono-label">
              {percentage}%
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-white transition-colors group-hover:text-[#FF3E00] sm:text-lg">
            {course.title}
          </h3>

          {lastAccessed?.title && (
            <p className="mt-1 line-clamp-1 text-xs text-neutral-500 sm:text-sm">
              Last opened: {lastAccessed.title}
            </p>
          )}

          <div className="mt-4 max-w-xl">
            <ProgressBar
              value={completed}
              max={total}
              showLabel={false}
            />
          </div>
        </div>

        <Link
          to={ROUTES.learn(
            course.id,
            lastAccessed?.resourceId
          )}
          className="lms-button lms-button-secondary w-full shrink-0 justify-center sm:w-auto"
        >
          {isCompleted ? 'Review Course' : 'Continue'}
          <Icon name="arrow-right" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = 'View all →',
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mono-label">{eyebrow}</p>

        <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
      </div>

      {href && (
        <Link
          to={href}
          className="self-start text-xs font-semibold text-neutral-500 transition-colors hover:text-[#FF3E00] sm:self-auto sm:text-sm"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden border border-neutral-800 bg-[#111111] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3E00] hover:bg-[#141414] sm:p-6"
    >
      <div className="flex size-10 items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-500 transition-colors group-hover:border-[#FF3E00] group-hover:text-[#FF3E00]">
        <Icon name={icon} className="size-5" />
      </div>

      <h3 className="mt-4 font-semibold text-white sm:mt-5">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-600 transition-colors group-hover:text-[#FF3E00]">
        Open
        <Icon name="arrow-right" className="size-3" />
      </div>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF3E00] transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const overview = useStudentOverview();
  const learning = useMyLearning();

  if (
    overview.status === REQUEST_STATUS.LOADING ||
    learning.status === REQUEST_STATUS.LOADING
  ) {
    return <DashboardSkeleton />;
  }

  if (overview.status === REQUEST_STATUS.ERROR) {
    return (
      <ApiErrorState
        error={overview.error}
        subject="dashboard"
        onRetry={overview.reload}
      />
    );
  }

  if (learning.status === REQUEST_STATUS.ERROR) {
    return (
      <ApiErrorState
        error={learning.error}
        subject="your courses"
        onRetry={learning.reload}
      />
    );
  }

  const overviewData = overview.data;
  const courses = learning.data ?? [];
  const recentActivity = overviewData?.recentActivity;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* HEADER */}
      <section className="reveal relative overflow-hidden border border-neutral-800 bg-[#111111]">
        <div className="grid-background absolute inset-0 opacity-20" />

        <div className="absolute right-0 top-0 hidden h-full w-px bg-gradient-to-b from-[#FF3E00] via-transparent to-transparent sm:block" />

        <div className="relative p-5 sm:p-7 lg:p-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#FF3E00] sm:w-8" />

                <p className="mono-label text-[#FF3E00]">
                  STUDENT / DASHBOARD
                </p>
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome back,
                <br />
                <span className="text-[#FF3E00]">
                  {user?.name || 'Learner'}.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
                Keep building your skills. Continue your current
                course or explore something new.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button
                as={Link}
                to={ROUTES.courses}
                className="w-full justify-center sm:w-auto"
              >
                Explore Courses
                <Icon name="arrow-right" className="size-4" />
              </Button>

              <Link
                to="/student/performance"
                className="lms-button lms-button-secondary w-full justify-center sm:w-auto"
              >
                View Performance
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="reveal">
        <div className="mb-4">
          <p className="mono-label">LEARNING OVERVIEW</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <StatCard
            label="Courses"
            value={overviewData.coursesWithProgress ?? 0}
            hint="Courses with progress"
            icon="book"
          />

          <StatCard
            label="Completed"
            value={overviewData.conceptsCompleted ?? 0}
            hint={`${overviewData.conceptsRemaining ?? 0} remaining`}
            icon="check"
          />

          <StatCard
            label="Quiz Attempts"
            value={overviewData.quizzes?.totalAttempts ?? 0}
            hint={`${overviewData.quizzes?.averageScore ?? 0}% average`}
            icon="clipboard"
          />

          <StatCard
            label="Passed"
            value={overviewData.quizzes?.passedCount ?? 0}
            hint={`${overviewData.quizzes?.failedCount ?? 0} failed`}
            icon="chart"
          />
        </div>
      </section>

      {/* CONTINUE LEARNING */}
      {recentActivity && (
        <section className="reveal">
          <SectionHeader
            eyebrow="RESUME"
            title="Continue Learning"
            href="/my-learning"
          />

          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_auto]">
              <div className="min-w-0 p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-3">
                  <span className="h-px w-6 bg-[#FF3E00]" />

                  <p className="mono-label text-[#FF3E00]">
                    LAST SESSION
                  </p>
                </div>

                <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-7 text-white sm:text-2xl">
                  {recentActivity.courseTitle}
                </h3>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Continue from your last opened resource.
                </p>

                {recentActivity.resourceTitle && (
                  <div className="mt-5 border-l-2 border-[#FF3E00] bg-[#0A0A0A] px-4 py-3 sm:mt-6">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                      Current Resource
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-neutral-300">
                      {recentActivity.resourceTitle}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center border-t border-neutral-800 bg-neutral-900/50 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                <Link
                  to={ROUTES.learn(
                    recentActivity.courseId,
                    recentActivity.resourceId
                  )}
                  className="lms-button lms-button-primary w-full justify-center lg:w-auto"
                >
                  Continue
                  <Icon
                    name="arrow-right"
                    className="size-4"
                  />
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* MY COURSES */}
      <section className="reveal">
        <SectionHeader
          eyebrow="YOUR LIBRARY"
          title="My Courses"
          href="/my-learning"
        />

        {courses.length === 0 ? (
          <EmptyLearning />
        ) : (
          <Card className="overflow-hidden px-4 sm:px-6">
            {courses.slice(0, 5).map((entry) => (
              <CourseRow
                key={entry.course.id}
                entry={entry}
              />
            ))}
          </Card>
        )}
      </section>

      {/* QUICK ACTIONS */}
      <section className="reveal">
        <div className="mb-4">
          <p className="mono-label">SHORTCUTS</p>

          <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Quick Actions
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
          <QuickAction
            to={ROUTES.courses}
            icon="book"
            title="Browse Courses"
            description="Discover new skills and learning paths."
          />

          <QuickAction
            to="/student/performance"
            icon="chart"
            title="Track Performance"
            description="Analyze your course and quiz performance."
          />

          <QuickAction
            to="/activity"
            icon="clock"
            title="Learning Activity"
            description="Review your recent learning activity."
          />
        </div>
      </section>
    </div>
  );
}

